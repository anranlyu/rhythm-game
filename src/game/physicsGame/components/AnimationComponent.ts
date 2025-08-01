import { Component } from '../../ecs/Component';
import { Entity } from '../../ecs/Entity';

export enum AnimationType {
  LANDING = 'landing',
  JUMP = 'jump',
  BOUNCE = 'bounce'
}

export interface AnimationState {
  type: AnimationType;
  duration: number;
  elapsed: number;
  isActive: boolean;
  scaleX: number;
  scaleY: number;
  alpha: number;
  rotation: number;
}

export class AnimationComponent extends Component {
  public animations: Map<AnimationType, AnimationState> = new Map();
  public currentAnimation: AnimationState | null = null;

  constructor(entity: Entity) {
    super(entity);
  }

  public startLandingAnimation(duration: number = 300): void {
    const landingAnim: AnimationState = {
      type: AnimationType.LANDING,
      duration: duration,
      elapsed: 0,
      isActive: true,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      rotation: 0
    };

    this.animations.set(AnimationType.LANDING, landingAnim);
    this.currentAnimation = landingAnim;
    
    console.log('Landing animation started!');
  }

  public startJumpAnimation(duration: number = 200): void {
    const jumpAnim: AnimationState = {
      type: AnimationType.JUMP,
      duration: duration,
      elapsed: 0,
      isActive: true,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      rotation: 0
    };

    this.animations.set(AnimationType.JUMP, jumpAnim);
    this.currentAnimation = jumpAnim;
  }

  public startBounceAnimation(duration: number = 400): void {
    const bounceAnim: AnimationState = {
      type: AnimationType.BOUNCE,
      duration: duration,
      elapsed: 0,
      isActive: true,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      rotation: 0
    };

    this.animations.set(AnimationType.BOUNCE, bounceAnim);
    this.currentAnimation = bounceAnim;
  }

  public updateAnimation(deltaTime: number): void {
    if (!this.currentAnimation || !this.currentAnimation.isActive) {
      return;
    }

    // Convert deltaTime from seconds to milliseconds since Timer returns seconds
    // but animation durations are specified in milliseconds
    const deltaTimeMs = deltaTime * 250;
    
    this.currentAnimation.elapsed += deltaTimeMs;
    const progress = this.currentAnimation.elapsed / this.currentAnimation.duration;

    if (progress >= 1.0) {
      // Animation complete
      this.currentAnimation.isActive = false;
      this.currentAnimation = null;
      console.log('✅ Animation completed!');
      return;
    }

    // Apply animation effects based on type
    switch (this.currentAnimation.type) {
      case AnimationType.LANDING:
        this.updateLandingAnimation(progress);
        break;
      case AnimationType.JUMP:
        this.updateJumpAnimation(progress);
        break;
      case AnimationType.BOUNCE:
        this.updateBounceAnimation(progress);
        break;
    }
  }

  private updateLandingAnimation(progress: number): void {
    if (!this.currentAnimation) return;

    // Landing effect: squash down, then bounce back
    if (progress < 0.3) {
      // Squash down phase
      const squashProgress = progress / 0.3;
      this.currentAnimation.scaleX = 1.0 + (0.3 * squashProgress); // Scale X wider
      this.currentAnimation.scaleY = 1.0 - (0.3 * squashProgress); // Scale Y shorter
    } else if (progress < 0.7) {
      // Bounce back phase
      const bounceProgress = (progress - 0.3) / 0.4;
      const bounce = Math.sin(bounceProgress * Math.PI) * 0.2;
      this.currentAnimation.scaleX = 1.0 + bounce;
      this.currentAnimation.scaleY = 1.0 + bounce; // Y also bounces back
    } else {
      // Settle phase
      const settleProgress = (progress - 0.7) / 0.3;
      this.currentAnimation.scaleX = 1.0 + (0.1 * (1 - settleProgress));
      this.currentAnimation.scaleY = 1.0 + (0.1 * (1 - settleProgress));
    }
  }

  private updateJumpAnimation(progress: number): void {
    if (!this.currentAnimation) return;

    // Jump effect: slight scale up
    const jumpScale = 1.0 + (0.1 * Math.sin(progress * Math.PI));
    this.currentAnimation.scaleX = jumpScale;
    this.currentAnimation.scaleY = jumpScale;
  }

  private updateBounceAnimation(progress: number): void {
    if (!this.currentAnimation) return;

    // Bounce effect: multiple bounces with decreasing intensity
    const bounce = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.3;
    this.currentAnimation.scaleX = 1.0 + bounce;
    this.currentAnimation.scaleY = 1.0 + bounce; // Y scale also bounces
    this.currentAnimation.rotation = Math.sin(progress * Math.PI * 2) * (1 - progress) * 0.1;
  }

  public getCurrentScaleX(): number {
    return this.currentAnimation?.scaleX || 1.0;
  }

  public getCurrentScaleY(): number {
    return this.currentAnimation?.scaleY || 1.0;
  }

  public getCurrentAlpha(): number {
    return this.currentAnimation?.alpha || 1.0;
  }

  public getCurrentRotation(): number {
    return this.currentAnimation?.rotation || 0.0;
  }

  public isAnimating(): boolean {
    return this.currentAnimation?.isActive || false;
  }
} 