// src/Game.tsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

import tanqueImg from './assets/tankRed.png';
import balaImg from './assets/bulletRedSilver.png';
import enemigoImg from './assets/tankRed.png';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const MAP_HEIGHT = 800;
  const MAP_WIDTH = 2000;

  useEffect(() => {
    class MainScene extends Phaser.Scene {
      player!: Phaser.Physics.Arcade.Image;
      cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      wasd!: Phaser.Types.Input.Keyboard.CursorKeys;
      fireKey!: Phaser.Input.Keyboard.Key;
      bullets!: Phaser.Physics.Arcade.Group;
      enemies!: Phaser.Physics.Arcade.Group;
      lastFired = 0;

      preload() {
        this.load.image('tanque', tanqueImg);
        this.load.image('bala', balaImg);
        this.load.image('enemigo', enemigoImg);
        this.load.tilemapTiledJSON('map', './assets/map.json');
        this.load.image('Barrel1', 'assets/PNG/Obstacles/barrelRed_up.png');
        this.load.image('Barrel2', 'assets/PNG/Obstacles/barrelGreen_side.png');
        this.load
      }

      create() {
        const map = this.make.tilemap({ key: 'mapa' });
        const tileset = map.addTilesetImage('nombreDelTilesetEnTiled', 'tiles');

        const groundLayer = map.createLayer('Ground', tileset);
        const wallsLayer = map.createLayer('Walls', tileset);

        // (opcional) Configurar colisiones
        wallsLayer.setCollisionByProperty({ collides: true });
        this.physics.world.convertTilemapLayer(wallsLayer);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.add.tileSprite(0, 0, 2000, 2000, 'background').setOrigin(0, 0);
        this.player = this.physics.add.image(30, 30, 'tanque')
            .setCollideWorldBounds(true)
            .setScale(0.5);
        this.player.setVelocity(0);
        this.player.setMaxVelocity(200);

        this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.bullets = this.physics.add.group({ defaultKey: 'bala', maxSize: 10 });

        this.enemies = this.physics.add.group();
        for (let i = 0; i < 5; i++) {
          this.enemies.create(Phaser.Math.Between(100, MAP_WIDTH), Phaser.Math.Between(50, 300), 'enemigo').setScale(0.5);
        }
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.fireMissile(pointer);
        });


        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
      }

      update(time: number) {
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
      }

      hitEnemy = (bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) => {
        const b = bullet as Phaser.Physics.Arcade.Image;
        const e = enemy as Phaser.Physics.Arcade.Image;
        b.disableBody(true, true);
        e.disableBody(true, true);
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
