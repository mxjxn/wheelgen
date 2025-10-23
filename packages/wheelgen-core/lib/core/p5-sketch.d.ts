import p5 from 'p5';
export declare function mountSketch(container: HTMLElement): {
    getP: () => p5;
    redraw: () => void;
    resetLogging: () => void;
    cleanup: () => void;
};
