import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { EntityManager } from './ecs/EntityManager';
import { SystemManager } from './ecs/SystemManager';
import { EventManager } from './events/EventManager';
import { KeyboardEvent as GameKeyboardEvent } from './events/KeyboardEvent';
import { Timer } from './Timer';
import { Logger } from './utils/Logger';
import { PerformanceMetrics } from './utils/PerformanceMetrics';

interface GameEngineProps {
  width: number;
  height: number;
  backgroundColor?: number;
  onInitialize?: (app: PIXI.Application) => void;
  onUpdate?: (deltaTime: number) => void;
  onRender?: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({
  width,
  height,
  backgroundColor = 0x1e1e1e,
  onInitialize,
  onUpdate,
  onRender,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<Timer | null>(null);

  // Get singletons
  const entityManager = EntityManager.getInstance();
  const systemManager = SystemManager.getInstance();
  const eventManager = EventManager.getInstance();
  const logger = Logger.getInstance();
  const performanceMetrics = PerformanceMetrics.getInstance();

  useEffect(() => {
    const initializePixi = async () => {
      if (!canvasRef.current) return;

      try {
        // Create PIXI application with better WebGL handling
        const app = new PIXI.Application();
        await app.init({
          width,
          height,
          backgroundColor,
          canvas: canvasRef.current,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          preference: 'webgl',
        });

        appRef.current = app;
        timerRef.current = new Timer(60);

        // Enable performance monitoring
        performanceMetrics.setEnabled(true);

        // Setup keyboard input
        setupInputHandling();

        // Initialize game
        if (onInitialize) {
          onInitialize(app);
        }

        logger.info('Game engine initialized');

        // Start game loop
        startGameLoop();
      } catch (error) {
        logger.error('Failed to initialize PIXI:', error);
      }
    };

    initializePixi();

    return () => {
      cleanup();
    };
  }, [width, height, backgroundColor, onInitialize]);

  const setupInputHandling = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyEvent = GameKeyboardEvent.createPressed(event.key, event.code);
      eventManager.emit(keyEvent);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const keyEvent = GameKeyboardEvent.createReleased(event.key, event.code);
      eventManager.emit(keyEvent);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Store cleanup functions for later removal
    const cleanup = {
      keydownCleanup: () =>
        window.removeEventListener('keydown', handleKeyDown),
      keyupCleanup: () => window.removeEventListener('keyup', handleKeyUp),
    };

    (
      appRef.current as PIXI.Application & { inputCleanup?: typeof cleanup }
    ).inputCleanup = cleanup;
  };

  const startGameLoop = () => {
    const gameLoop = () => {
      if (!timerRef.current || !appRef.current) return;

      const timer = timerRef.current;
      timer.update();
      logger.setFrameNumber(timer.getFrameCount());

      const deltaTime = timer.getSmoothedDeltaTime();

      try {
        // Process events
        eventManager.processEvents();

        // Update systems
        if (onUpdate) {
          onUpdate(deltaTime);
        }
        systemManager.updateSystems(deltaTime);

        // Render
        if (onRender) {
          onRender();
        }
      } catch (error) {
        logger.error('Error in game loop:', error);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const cleanup = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (appRef.current) {
      // Cleanup input handlers
      const appWithCleanup = appRef.current as PIXI.Application & {
        inputCleanup?: { keydownCleanup: () => void; keyupCleanup: () => void };
      };
      if (appWithCleanup.inputCleanup) {
        appWithCleanup.inputCleanup.keydownCleanup();
        appWithCleanup.inputCleanup.keyupCleanup();
      }

      appRef.current.destroy(true);
      appRef.current = null;
    }

    // Clear managers
    entityManager.clear();
    eventManager.clear();
    performanceMetrics.reset();

    logger.info('Game engine cleaned up');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          border: '1px solid #333',
        }}
      />
    </div>
  );
};
