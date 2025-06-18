export class Timer {
  private targetFPS: number;
  private targetFrameTime: number;
  private lastFrameTime: number;
  private frameCount: number;
  private deltaTime: number;
  private smoothedDeltaTime: number;
  private frameTimeBuffer: number[];
  private bufferSize: number;
  private currentBufferIndex: number;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.targetFrameTime = 1000 / targetFPS;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.deltaTime = 0;
    this.smoothedDeltaTime = 0;
    
    // Frame time smoothing buffer
    this.bufferSize = 10;
    this.frameTimeBuffer = new Array(this.bufferSize).fill(this.targetFrameTime);
    this.currentBufferIndex = 0;
  }

  public update(): void {
    const currentTime = performance.now();
    this.deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Update smoothing buffer
    this.frameTimeBuffer[this.currentBufferIndex] = this.deltaTime;
    this.currentBufferIndex = (this.currentBufferIndex + 1) % this.bufferSize;

    // Calculate smoothed delta time
    const sum = this.frameTimeBuffer.reduce((a, b) => a + b, 0);
    this.smoothedDeltaTime = sum / this.bufferSize;
  }

  public getDeltaTime(): number {
    return this.deltaTime / 1000; // Convert to seconds
  }

  public getSmoothedDeltaTime(): number {
    return this.smoothedDeltaTime / 1000; // Convert to seconds
  }

  public getFPS(): number {
    return this.deltaTime > 0 ? 1000 / this.deltaTime : 0;
  }

  public getSmoothedFPS(): number {
    return this.smoothedDeltaTime > 0 ? 1000 / this.smoothedDeltaTime : 0;
  }

  public getFrameCount(): number {
    return this.frameCount;
  }

  public getTargetFPS(): number {
    return this.targetFPS;
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.targetFrameTime = 1000 / fps;
  }

  public getTargetFrameTime(): number {
    return this.targetFrameTime;
  }

  public isRunningSlowly(): boolean {
    return this.smoothedDeltaTime > this.targetFrameTime * 1.2;
  }

  public getPerformanceRatio(): number {
    return this.targetFrameTime / this.smoothedDeltaTime;
  }

  public reset(): void {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.deltaTime = 0;
    this.frameTimeBuffer.fill(this.targetFrameTime);
    this.currentBufferIndex = 0;
  }
} 