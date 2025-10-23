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
declare class DeferredRenderManager {
    private queue;
    private timeout;
    private metrics;
    private isRendering;
    private renderCallback;
    private maxMetrics;
    constructor();
    setRenderCallback(callback: () => void): void;
    scheduleRender(operation: Omit<RenderOperation, 'id' | 'timestamp'>): void;
    private getDelayForPriority;
    private executeRender;
    private recordMetrics;
    getPerformanceReport(): PerformanceReport;
    getQueueSize(): number;
    isCurrentlyRendering(): boolean;
    forceRender(): void;
    clearQueue(): void;
}
export declare const deferredRenderManager: DeferredRenderManager;
export declare const isRendering: import("solid-js").Accessor<boolean>, setIsRendering: import("solid-js").Setter<boolean>;
export declare const lastRenderTime: import("solid-js").Accessor<number>, setLastRenderTime: import("solid-js").Setter<number>;
export declare const queueSize: import("solid-js").Accessor<number>, setQueueSize: import("solid-js").Setter<number>;
export declare const performanceMetrics: import("solid-js").Accessor<PerformanceReport>;
export declare const schedulePaletteRender: (data: any, immediate?: boolean) => void;
export declare const scheduleRingRender: (data: any, immediate?: boolean) => void;
export declare const scheduleStrokeRender: (data: any, immediate?: boolean) => void;
export declare const scheduleGlobalRender: (data: any, immediate?: boolean) => void;
export declare const scheduleUIRender: (data: any, immediate?: boolean) => void;
export {};
