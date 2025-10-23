import { createSignal, createMemo } from 'solid-js';

// Types for render operations
export interface RenderOperation {
  id: string;
  type: 'palette' | 'ring' | 'stroke' | 'global' | 'ui';
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  data: any;
  immediate: boolean;
}

export interface RenderMetrics {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  operationType: string;
  success: boolean;
}

export interface PerformanceReport {
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenders: number;
  slowRenders: number;
  queueSize: number;
  isRendering: boolean;
}

// Deferred Render Manager
class DeferredRenderManager {
  private queue: RenderOperation[] = [];
  private timeout: number | null = null;
  private metrics: RenderMetrics[] = [];
  private isRendering = false;
  private renderCallback: (() => void) | null = null;
  
  // Performance tracking
  private maxMetrics = 50; // Keep last 50 render metrics
  
  constructor() {
    // Initialize with empty state
  }
  
  // Set the callback function that actually performs the render
  setRenderCallback(callback: () => void) {
    this.renderCallback = callback;
  }
  
  // Schedule a render operation
  scheduleRender(operation: Omit<RenderOperation, 'id' | 'timestamp'>) {
    const fullOperation: RenderOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    // Add to queue
    this.queue.push(fullOperation);
    
    // If immediate, render right away
    if (operation.immediate) {
      this.executeRender();
      return;
    }
    
    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Set new timeout based on priority
    const delay = this.getDelayForPriority(operation.priority);
    this.timeout = setTimeout(() => {
      this.executeRender();
    }, delay);
  }
  
  // Get delay based on priority
  private getDelayForPriority(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high': return 16; // ~60fps
      case 'normal': return 50; // 20fps
      case 'low': return 200; // 5fps
      default: return 50;
    }
  }
  
  // Execute the render
  private executeRender() {
    if (this.isRendering || !this.renderCallback) {
      return;
    }
    
    this.isRendering = true;
    const startTime = performance.now();
    
    try {
      // Execute the actual render
      this.renderCallback();
      
      // Record metrics
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetrics({
        id: `render_${Date.now()}`,
        startTime,
        endTime,
        duration,
        operationType: 'batch',
        success: true
      });
      
    } catch (error) {
      
      // Record failed metrics
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetrics({
        id: `render_${Date.now()}`,
        startTime,
        endTime,
        duration,
        operationType: 'batch',
        success: false
      });
    } finally {
      this.isRendering = false;
      this.queue = []; // Clear processed operations
      this.timeout = null;
    }
  }
  
  // Record render metrics
  private recordMetrics(metrics: RenderMetrics) {
    this.metrics.push(metrics);
    
    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
  
  // Get performance report
  getPerformanceReport(): PerformanceReport {
    const recentMetrics = this.metrics.slice(-10); // Last 10 renders
    const averageRenderTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
      : 0;
    
    const lastRenderTime = this.metrics.length > 0 
      ? this.metrics[this.metrics.length - 1].duration
      : 0;
    
    const slowRenders = this.metrics.filter(m => m.duration > 16).length; // > 16ms is slow
    
    return {
      averageRenderTime,
      lastRenderTime,
      totalRenders: this.metrics.length,
      slowRenders,
      queueSize: this.queue.length,
      isRendering: this.isRendering
    };
  }
  
  // Get current queue size
  getQueueSize(): number {
    return this.queue.length;
  }
  
  // Check if currently rendering
  isCurrentlyRendering(): boolean {
    return this.isRendering;
  }
  
  // Force immediate render (for manual triggers)
  forceRender() {
    this.executeRender();
  }
  
  // Clear all pending operations
  clearQueue() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.queue = [];
  }
}

// Global instance
export const deferredRenderManager = new DeferredRenderManager();

// Solid.js signals for UI reactivity
export const [isRendering, setIsRendering] = createSignal(false);
export const [lastRenderTime, setLastRenderTime] = createSignal(0);
export const [queueSize, setQueueSize] = createSignal(0);

// Performance monitoring effect
export const performanceMetrics = createMemo(() => {
  const report = deferredRenderManager.getPerformanceReport();
  setIsRendering(report.isRendering);
  setLastRenderTime(report.lastRenderTime);
  setQueueSize(report.queueSize);
  return report;
});

// Helper functions for common operations
export const schedulePaletteRender = (data: any, immediate = false) => {
  deferredRenderManager.scheduleRender({
    type: 'palette',
    priority: immediate ? 'high' : 'normal',
    data,
    immediate
  });
};

export const scheduleRingRender = (data: any, immediate = false) => {
  deferredRenderManager.scheduleRender({
    type: 'ring',
    priority: immediate ? 'high' : 'normal',
    data,
    immediate
  });
};

export const scheduleStrokeRender = (data: any, immediate = false) => {
  deferredRenderManager.scheduleRender({
    type: 'stroke',
    priority: immediate ? 'high' : 'normal',
    data,
    immediate
  });
};

export const scheduleGlobalRender = (data: any, immediate = false) => {
  deferredRenderManager.scheduleRender({
    type: 'global',
    priority: immediate ? 'high' : 'normal',
    data,
    immediate
  });
};

export const scheduleUIRender = (data: any, immediate = true) => {
  deferredRenderManager.scheduleRender({
    type: 'ui',
    priority: 'high',
    data,
    immediate
  });
};
