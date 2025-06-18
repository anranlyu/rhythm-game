interface SystemMetrics {
  totalTime: number;
  callCount: number;
  minTime: number;
  maxTime: number;
  lastTime: number;
}

export class PerformanceGuard {
  private startTime: number;
  private systemName: string;
  private metrics: PerformanceMetrics;

  constructor(systemName: string, metrics: PerformanceMetrics) {
    this.systemName = systemName;
    this.metrics = metrics;
    this.startTime = performance.now();
  }

  public dispose(): void {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    this.metrics.recordTime(this.systemName, duration);
  }
}

export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, SystemMetrics> = new Map();
  private enabled: boolean = false;

  private constructor() {}

  public static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public createPerformanceGuard(systemName: string): PerformanceGuard {
    return new PerformanceGuard(systemName, this);
  }

  public recordTime(systemName: string, duration: number): void {
    if (!this.enabled) return;

    let systemMetrics = this.metrics.get(systemName);
    if (!systemMetrics) {
      systemMetrics = {
        totalTime: 0,
        callCount: 0,
        minTime: Infinity,
        maxTime: 0,
        lastTime: 0
      };
      this.metrics.set(systemName, systemMetrics);
    }

    systemMetrics.totalTime += duration;
    systemMetrics.callCount++;
    systemMetrics.minTime = Math.min(systemMetrics.minTime, duration);
    systemMetrics.maxTime = Math.max(systemMetrics.maxTime, duration);
    systemMetrics.lastTime = duration;
  }

  public getMetrics(systemName: string): SystemMetrics | undefined {
    return this.metrics.get(systemName);
  }

  public getAllMetrics(): Map<string, SystemMetrics> {
    return new Map(this.metrics);
  }

  public getAverageTime(systemName: string): number {
    const metrics = this.metrics.get(systemName);
    return metrics ? metrics.totalTime / metrics.callCount : 0;
  }

  public reset(): void {
    this.metrics.clear();
  }

  public getReport(): string {
    let report = 'Performance Report:\n';
    report += '==================\n';
    
    for (const [systemName, metrics] of this.metrics) {
      const avgTime = metrics.totalTime / metrics.callCount;
      report += `${systemName}:\n`;
      report += `  Calls: ${metrics.callCount}\n`;
      report += `  Total: ${metrics.totalTime.toFixed(2)}ms\n`;
      report += `  Average: ${avgTime.toFixed(2)}ms\n`;
      report += `  Min: ${metrics.minTime.toFixed(2)}ms\n`;
      report += `  Max: ${metrics.maxTime.toFixed(2)}ms\n`;
      report += `  Last: ${metrics.lastTime.toFixed(2)}ms\n\n`;
    }
    
    return report;
  }
} 