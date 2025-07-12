// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { sendMessage } from './services/Websocket';

import tanqueImg from '../public/assets/tankRed.png';
import balaImg from '../public/assets/bulletRedSilver.png';
import tank2Img from '../public/assets/tankBlue.png';
import { useGameStore } from './store/Store';
import { useUser } from './context/AuthContext';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const MAP_HEIGHT = 832;
  const MAP_WIDTH = 1984;
  const {userId} = useUser();
  const gameState = useGameStore(state => state.game);
  const playerState = gameState?.players[userId || ""];

  useEffect(() => {
    if(gameState === undefined) return;
    class MainScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Image;
      players!:{ [key: string]:Phaser.Physics.Arcade.Image};
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      wasd!: Phaser.Types.Input.Keyboard.CursorKeys;
      fireKey!: Phaser.Input.Keyboard.Key;
      bullets!: Phaser.Physics.Arcade.Group;
      lastPosition!:{ x: number; y: number; rotation: number } ;
      lastSent = Date.now();
      lastFired = 0;

      preload() {
        this.load.image('tanque', tanqueImg);
        this.load.image('bala', balaImg);
        this.load.image('tanque2',tank2Img );
        this.load.tilemapTiledJSON('map', './assets/map.json');
        this.load.image('tiles', './assets/tiles.png');
        this.load.image('fortress', './assets/fortress.png')
      }

      create() {
        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        const map = this.make.tilemap({ key: 'map' });
        const tileSet = map.addTilesetImage('tiles', 'tiles');
        const fortressSet = map.addTilesetImage('fortress', 'fortress');

        map.createLayer('Ground', tileSet, 0, 0);
        const objectLayer = map.createLayer('Objects', tileSet, 0, 0);
        objectLayer?.setCollisionByProperty({ collides: true });
        const fortressLayer = map.createLayer('Fortress', fortressSet, 0, 0);
        fortressLayer?.setCollisionByProperty({ collides: true });

        this.bullets = this.physics.add.group({ defaultKey: 'bala', maxSize: 10 });
        this.players = {};

        for (const playerId in gameState?.players) {
          const player = gameState.players[playerId];
          if (!player || !player.position) continue;

          const sprite = this.physics.add.image(
            player.position.x,
            player.position.y,
            player.team1 ? 'tanque' : 'tanque2')
          .setRotation(player.position.angle)
          .setCollideWorldBounds(true)
          .setVelocity(0)
          .setMaxVelocity(200);

          if (playerId === userId) {
            this.player = sprite;
            this.lastPosition = {x: player.position.x, y: player.position.y, rotation: player.position.angle};
            continue;
          }

        this.players[playerId] = sprite;

        this.physics.add.collider(sprite, objectLayer);
        this.physics.add.collider(sprite, fortressLayer);

        if (playerState?.team1 !== player.team1 && this.bullets && sprite) {
          this.physics.add.overlap(this.bullets, sprite, this.hitEnemy, undefined, this);
        }
      }

        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;
        this.physics.add.collider(this.player, objectLayer);
        this.physics.add.collider(this.player, fortressLayer);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.collider(this.bullets, objectLayer, (bullet, tile) => {
          bullet.destroy();
        });

        this.physics.add.collider(this.bullets, fortressLayer, (bullet, tile) => {
          bullet.destroy();
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.fireMissile(pointer);
        });

      }

      update(time: number, delta: number) {
        const speed = 100;
        if (this.cursors.left?.isDown || this.wasd.left?.isDown) {
            this.player.setAngularVelocity(-speed);
        } else if (this.cursors.right?.isDown || this.wasd.right?.isDown) {
            this.player.setAngularVelocity(speed);
        } else {
            this.player.setAngularVelocity(0);
        }

        if (this.cursors.up?.isDown || this.wasd.up?.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, speed, this.player.body.velocity);
        } else if (this.cursors.down?.isDown || this.wasd.down?.isDown) {
            this.physics.velocityFromRotation(this.player.rotation, -speed, this.player.body.velocity);
        } else {
            this.player.setVelocity(0, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.fireKey) && time > this.lastFired) {
          const bullet = this.bullets.get(this.player.x, this.player.y) as Phaser.Physics.Arcade.Image;
          if (bullet) {
            bullet.setActive(true).setVisible(true).setRotation(this.player.rotation).setScale(0.7);
            bullet.enableBody(true, this.player.x, this.player.y, true, true);
            this.physics.velocityFromRotation(this.player.rotation, 500, bullet.body.velocity);
            this.lastFired = time + 300;
          }
        }

        this.bullets.children.iterate((b) => {
          const bullet = b as Phaser.Physics.Arcade.Image;
          if (bullet.active && (bullet.x < 0 || bullet.x > MAP_WIDTH || bullet.y < 0 || bullet.y > MAP_HEIGHT)) {
            bullet.setActive(false).setVisible(false);
          }
        });

        const players = useGameStore.getState().playerPositions;

        for (const id in players) {
          if (id === userId) continue;

          const data = players[id];
          let sprite = this.players[id];
          if (!sprite) {
            sprite = this.physics.add.image(data.x, data.y, "player");
            this.players[id] = sprite;
          }

          if (
            sprite.x !== data.x ||
            sprite.y !== data.y ||
            sprite.rotation !== data.angle
          ) {
            sprite.setPosition(data.x, data.y);
            sprite.setRotation(data.angle);
          }
        }

        const { x, y, rotation } = this.player;
        let now = Date.now();
        if (
            (now - this.lastSent) > 20 && (
            x !== this.lastPosition.x ||
            y !== this.lastPosition.y ||
            rotation !== this.lastPosition.rotation
            )
        ) {
            const message = {
                type: "MOVE",
                payload: {
                    x: x,
                    y: y,
                    angle: rotation,
                },
            };

            sendMessage(JSON.stringify(message)); 
            
            this.lastPosition = { x, y, rotation };
            this.lastSent = Date.now();
        }

      }

      hitEnemy = (enemy: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) => {
        const b = bullet as Phaser.Physics.Arcade.Image;
        const e = enemy as Phaser.Physics.Arcade.Image;
        b.disableBody(true, true);
      };

      fireMissile(pointer: Phaser.Input.Pointer) {
        if(this.lastFired > this.time.now) return;
        
        const bullet = this.bullets.get(this.player.x, this.player.y) as Phaser.Physics.Arcade.Image;
        if (!bullet) return;

        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.7);

        // Posicionar en el tanque
        
        bullet.enableBody(true, this.player.x, this.player.y, true, true);
        bullet.setPosition(this.player.x, this.player.y);

        // Calcular ángulo entre tanque y puntero
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);

        // Apuntar visualmente el misil en esa dirección
        bullet.setRotation(angle);

        // Calcular y aplicar velocidad
        const velocity = this.physics.velocityFromRotation(angle, 500);
        bullet.setVelocity(velocity.x, velocity.y);
        this.lastFired = this.time.now + 300; 
      }

    }

    

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 550,
      parent: gameRef.current!,
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: MainScene
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default Game;
