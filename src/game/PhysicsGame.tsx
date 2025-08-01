import * as PIXI from 'pixi.js';
import { GameEngine } from './GameEngine';
import { PhysicsGame as PhysicsGameClass } from './physicsGame/PhysicsGame';

interface PhysicsGameProps {
  width: number;
  height: number;
}

export const PhysicsGame = ({ width, height }: PhysicsGameProps) => {
  let physicsGame: PhysicsGameClass | null = null;

  const initializeGame = async (app: PIXI.Application) => {
    try {
      physicsGame = new PhysicsGameClass(app);
      await physicsGame.initialize();
      console.log('Physics game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize physics game:', error);
    }
  };

  const updateGame = (deltaTime: number) => {
    if (physicsGame) {
      physicsGame.update(deltaTime);
    }
  };

  return (
    <div>
      <h2 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>
        Physics Jump Demo
      </h2>
      <GameEngine
        width={width}
        height={height}
        backgroundColor={0x1a1a1a}
        onInitialize={initializeGame}
        onUpdate={updateGame}
      />
    </div>
  );
};
