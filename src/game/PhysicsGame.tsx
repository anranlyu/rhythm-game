import * as PIXI from 'pixi.js';
import { ComponentManager } from './ecs/ComponentManager';
import { EntityManager } from './ecs/EntityManager';
import { SystemManager } from './ecs/SystemManager';
import { GameEngine } from './GameEngine';

interface PhysicsGameProps {
  width: number;
  height: number;
}

export const PhysicsGame = ({ width, height }: PhysicsGameProps) => {
  const initializeGame = (app: PIXI.Application) => {
    const entityManager = EntityManager.getInstance();
    const componentManager = ComponentManager.getInstance();
    const systemManager = SystemManager.getInstance();
  };

  const updateGame = (deltaTime: number) => {
    const systemManager = SystemManager.getInstance();
    systemManager.updateSystems(deltaTime);
  };

  return (
    <div>
      <GameEngine
        width={width}
        height={height}
        backgroundColor={0x222222}
        onInitialize={initializeGame}
        onUpdate={updateGame}
      />
    </div>
  );
};
