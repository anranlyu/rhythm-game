import React from 'react';
import * as PIXI from 'pixi.js';
import { GameEngine } from './GameEngine';
import { EntityManager } from './ecs/EntityManager';
import { ComponentManager } from './ecs/ComponentManager';
import { SystemManager } from './ecs/SystemManager';
import { Entity } from './ecs/Entity';

import { RhythmGameStateComponent } from './rhythm/components/RhythmGameStateComponent';
import { RhythmLaneComponent } from './rhythm/components/RhythmLaneComponent';
import { HitLineComponent } from './rhythm/components/HitLineComponent';
import { RhythmNoteSystem } from './rhythm/systems/RhythmNoteSystem';
import { RhythmInputSystem } from './rhythm/systems/RhythmInputSystem';
import { RhythmSpawnSystem } from './rhythm/systems/RhythmSpawnSystem';
import { RhythmRenderSystem } from './rhythm/systems/RhythmRenderSystem';

interface RhythmGameProps {
  width?: number;
  height?: number;
}

export const RhythmGame: React.FC<RhythmGameProps> = ({
  width = 500,
  height = 600,
}) => {
  const initializeGame = (app: PIXI.Application) => {
    const entityManager = EntityManager.getInstance();
    const componentManager = ComponentManager.getInstance();
    const systemManager = SystemManager.getInstance();

    // Create game state entity
    const gameStateEntity = entityManager.createEntity('GameState');
    const gameState = new RhythmGameStateComponent(
      gameStateEntity,
      width,
      height
    );
    componentManager.addComponent(gameStateEntity, gameState);

    // Create lanes
    const laneEntities: Entity[] = [];
    for (let i = 0; i < 5; i++) {
      const laneEntity = entityManager.createEntity(`Lane_${i}`);
      const lane = new RhythmLaneComponent(
        laneEntity,
        i,
        gameState.laneWidth,
        height,
        gameState.getLaneX(i),
        0
      );
      componentManager.addComponent(laneEntity, lane);
      laneEntities.push(laneEntity);
    }

    // Create hit line
    const hitLineEntity = entityManager.createEntity('HitLine');
    const hitLine = new HitLineComponent(
      hitLineEntity,
      gameState.hitLineY,
      width
    );
    componentManager.addComponent(hitLineEntity, hitLine);

    // Create and add systems
    const noteSystem = new RhythmNoteSystem();
    const inputSystem = new RhythmInputSystem();
    const spawnSystem = new RhythmSpawnSystem();
    const renderSystem = new RhythmRenderSystem(app);

    // Configure systems
    inputSystem.setGameStateEntity(gameStateEntity);
    inputSystem.setHitLineEntity(hitLineEntity);
    spawnSystem.setGameStateEntity(gameStateEntity);
    renderSystem.setGameStateEntity(gameStateEntity);

    // Add all systems to system manager
    systemManager.addSystem(spawnSystem);
    systemManager.addSystem(noteSystem);
    systemManager.addSystem(inputSystem);
    systemManager.addSystem(renderSystem);

    // Initial render setup
    renderSystem.renderLanes(laneEntities);
    renderSystem.renderHitLine(hitLineEntity);

    console.log('Rhythm game initialized!');
    console.log('Press keys 1-5 to hit notes when they reach the white line');
  };

  const updateGame = (deltaTime: number) => {
    const systemManager = SystemManager.getInstance();
    systemManager.updateSystems(deltaTime);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
      }}
    >
      <h1 style={{ margin: '20px 0', fontSize: '2rem' }}>Rhythm Game</h1>
      <p style={{ margin: '10px 0', fontSize: '1rem', textAlign: 'center' }}>
        Press keys 1-5 when the colored boxes reach the white line!
      </p>
      <GameEngine
        width={width}
        height={height}
        backgroundColor={0x222222}
        onInitialize={initializeGame}
        onUpdate={updateGame}
      />
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#333',
          borderRadius: '5px',
          textAlign: 'center',
        }}
      >
        <h3>Controls:</h3>
        <p>
          Lane 1: Press '1' | Lane 2: Press '2' | Lane 3: Press '3' | Lane 4:
          Press '4' | Lane 5: Press '5'
        </p>
      </div>
    </div>
  );
};
