// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { sendMessage } from './services/Websocket';

import tanqueImg from '../public/assets/tankRed.png';
import balaImg from '../public/assets/bulletRedSilver.png';
import bala2Img from '../public/assets/bulletBlueSilver.png';
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
  const barWidth = 150;
  const barHeight = 10;
  const barOtherWidth = 32;
  const barOtherHeight = 4;

  useEffect(() => {
    if(gameState === undefined) return;
    class MainScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Image;
      players!:{ [key: string]: {
          sprite: Phaser.Physics.Arcade.Image;
          hpBar: Phaser.GameObjects.Rectangle;
          hpBarBg: Phaser.GameObjects.Rectangle;
      }};
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      wasd!: Phaser.Types.Input.Keyboard.CursorKeys;
      fireKey!: Phaser.Input.Keyboard.Key;
      bullets!: Phaser.Physics.Arcade.Group;
      otherBullets!: Phaser.Physics.Arcade.Group;
      lastPosition!:{ x: number; y: number; rotation: number } ;
      hpBar!: Phaser.GameObjects.Rectangle;
      hpBarBg!: Phaser.GameObjects.Rectangle;
      lastSent = Date.now();
      lastFired = 0;
      alive = true;

      preload() {
        this.load.image('tanque', tanqueImg);
        this.load.image('bala', balaImg);
        this.load.image('bala2', bala2Img);
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

        this.bullets = this.physics.add.group({ defaultKey: playerState?.team1 ? 'bala' : 'bala2', maxSize: 10 });
        this.otherBullets = this.physics.add.group({classType: Phaser.Physics.Arcade.Image});
        this.players = {};


        this.hpBarBg = this.add.rectangle(
          20,
          20,
          barWidth,
          barHeight,
          0x000000
        ).setOrigin(0, 0).setScrollFactor(0);

        // Barra roja
        this.hpBar = this.add.rectangle(
          20,
          20,
          barWidth,
          barHeight,
          0xff0000
        ).setOrigin(0, 0).setScrollFactor(0);

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

          
          this.physics.add.collider(sprite, objectLayer);
          this.physics.add.collider(sprite, fortressLayer);

          if (playerId === userId) {
            this.player = sprite;
            this.lastPosition = {x: player.position.x, y: player.position.y, rotation: player.position.angle};
            this.physics.add.overlap(this.otherBullets, sprite, this.hitEnemy, undefined, this);
            continue;
          }

          const hpBarBg = this.add.rectangle(player.position.x - 16, player.position.y - 30, barOtherWidth, barOtherHeight, 0x000000);
          const hpBar = this.add.rectangle(player.position.x - 16, player.position.y - 30, barOtherWidth, barOtherHeight, 0xff0000);
          hpBarBg.setOrigin(0, 0);
          hpBar.setOrigin(0, 0);

        this.players[playerId] = {sprite, hpBarBg, hpBar};

        if (sprite) {
          this.physics.add.overlap(this.bullets, sprite, this.hitEnemy, undefined, this);
          this.physics.add.overlap(this.otherBullets, sprite, this.hitEnemy, undefined, this);
        }
      }

        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true;
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

        this.physics.add.collider(this.otherBullets, objectLayer, (bullet, tile) => {
          bullet.destroy();
        });

        this.physics.add.collider(this.otherBullets, fortressLayer, (bullet, tile) => {
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

        if (Phaser.Input.Keyboard.JustDown(this.fireKey) && time > this.lastFired && this.alive) {
          const offset = 28;
          const angle = this.player.rotation;
          const startX = this.player.x + Math.cos(angle) * offset;
          const startY = this.player.y + Math.sin(angle) * offset;
          const bullet = this.bullets.get(startX, startY ) as Phaser.Physics.Arcade.Image;
          if (bullet) {
            bullet.setActive(true).setVisible(true).setRotation(angle).setScale(0.7);
            bullet.enableBody(true, startX, startY, true, true);
            this.physics.velocityFromRotation(this.player.rotation, 500, bullet.body.velocity);
            this.lastFired = time + 300;
            sendMessage(JSON.stringify({
              Type: "SHOOT",
              Payload: {
                ownerId: userId,
                x: startX,
                y: startY,
                angle: angle,
              }
            }));
          }
        }

        this.bullets.children.iterate((b) => {
          const bullet = b as Phaser.Physics.Arcade.Image;
          if (bullet.active && (bullet.x < 0 || bullet.x > MAP_WIDTH || bullet.y < 0 || bullet.y > MAP_HEIGHT)) {
            bullet.setActive(false).setVisible(false);
          }
        });

        this.otherBullets.children.iterate((b) => {
          const bullet = b as Phaser.Physics.Arcade.Image;
          if (bullet.active && (bullet.x < 0 || bullet.x > MAP_WIDTH || bullet.y < 0 || bullet.y > MAP_HEIGHT)) {
            bullet.setActive(false).setVisible(false);
          }
        });

        this.updatePlayers();

        const bullets = useGameStore.getState().playersBullets;
        for(let id in bullets){
          const data = bullets[id];

          const bullet = this.otherBullets.create(data.position.x, data.position.y , data.team1 ? 'bala' : 'bala2') as Phaser.Physics.Arcade.Image;
          bullet.enableBody(true, data.position.x, data.position.y, true, true);
          bullet.rotation = data.position.angle;
          bullet.setScale(0.7);
          this.physics.velocityFromRotation(data.position.angle, 500, bullet.body.velocity);
          useGameStore.getState().removeBullet(id);
        }

        const hits = useGameStore.getState().playerHits;
        for (let playerId in hits) {
          const percentage = Phaser.Math.Clamp(hits[playerId] / 60, 0, 1);
          if(playerId === userId){
            this.hpBar.width = barWidth*percentage;
            useGameStore.getState().removeHit(playerId);
            continue;
          }
          let {hpBar} = this.players[playerId];
          hpBar.width = barOtherWidth*percentage;
          useGameStore.getState().removeHit(playerId);
        }

        const deadPlayers = useGameStore.getState().deadPlayers;
        for(let playerId of deadPlayers){
          if(playerId === userId){
            this.player.disableBody(true, true);
            this.hpBar.width = 0;
            this.alive = false;
            continue;
          }

          let {sprite, hpBar, hpBarBg} = this.players[playerId];
          sprite.disableBody(true, true);
          hpBar.setVisible(false);
          hpBarBg.setVisible(false);
        }

        const { x, y, rotation } = this.player;
        let now = Date.now();
        if (
            (now - this.lastSent) > 50 && (
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

      updatePlayers() {
        const players = useGameStore.getState().playerPositions;
      
        for (const id in players) {
          if (id === userId) continue;
      
          const data = players[id];
          let { sprite, hpBarBg, hpBar } = this.players[id];
      
          if (!sprite) {
            sprite = this.physics.add.image(data.x, data.y, "player");
            this.players[id].sprite = sprite;
          }
      
          if (
            sprite.x !== data.x ||
            sprite.y !== data.y ||
            sprite.rotation !== data.angle
          ) {
            const t = 0.2;
            sprite.x += (data.x - sprite.x) * t;
            sprite.y += (data.y - sprite.y) * t;
      
            const offsetX = -16;
            const offsetY = -30;
            hpBarBg.x = sprite.x + offsetX;
            hpBarBg.y = sprite.y + offsetY;
            hpBar.x = sprite.x + offsetX;
            hpBar.y = sprite.y + offsetY;
      
            const step = 0.2;
            sprite.rotation = Phaser.Math.Angle.RotateTo(
              sprite.rotation,
              data.angle || 0,
              step
            );
          }
        }
      }
      

      hitEnemy = (enemy: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) => {
        const b = bullet as Phaser.Physics.Arcade.Image;
        const e = enemy as Phaser.Physics.Arcade.Image;
        b.disableBody(true, true);
      };

      fireMissile(pointer: Phaser.Input.Pointer) {
        if(this.lastFired > this.time.now || !this.alive) return;
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        const offset = 28;
        const startX = this.player.x + Math.cos(angle) * offset;
        const startY = this.player.y + Math.sin(angle) * offset;
        const bullet = this.bullets.get(startX, startY ) as Phaser.Physics.Arcade.Image;
        if (!bullet) return;

        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.7);

        
        bullet.enableBody(true, startX, startY, true, true);
        bullet.setPosition(startX, startY);

        bullet.setRotation(angle);

        // Calcular y aplicar velocidad
        const velocity = this.physics.velocityFromRotation(angle, 500);
        bullet.setVelocity(velocity.x, velocity.y);
        this.lastFired = this.time.now + 300; 
        sendMessage(JSON.stringify({
          Type: "SHOOT",
          Payload: {
            ownerId: userId,
            x: startX,
            y: startY,
            angle: angle,
          }
        }));
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
