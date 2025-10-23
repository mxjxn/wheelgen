import type p5 from 'p5';
import { getPixelRenderer, PixelStrokeOptions } from './pixel-renderer';

/**
 * Pixel-based alphabet drawing functions
 * 
 * These functions use the PixelStrokeRenderer to generate high-performance
 * stroke textures instead of drawing multiple line segments per particle.
 * 
 * Performance Benefits:
 * - Single draw call per stroke instead of 7+ line segments
 * - Pre-computed textures cached for reuse
 * - Better texture simulation with actual pixel manipulation
 * - Significant performance improvement (potentially 10x+ faster)
 */

export interface PixelDiamondDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  strokeWidth?: number;
  strokeCount?: number;
  colorBleed?: number;
  segments?: number;
  length?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawPixelDiamond(p: p5, options: PixelDiamondDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    strokeWidth = 0.25,
    strokeCount = 1,
    colorBleed = 0,
    length = 1.0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  const pixelRenderer = getPixelRenderer();
  
  // Use the first color for the base stroke, or baseColor if no colors provided
  const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
  
  const pixelOptions: PixelStrokeOptions = {
    w,
    h,
    strokeWidth,
    strokeCount,
    colorBleed,
    baseColor: strokeColor,
    strokeType: 'd',
    length,
    size,
    rotation
  };

  // Render the stroke texture
  pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
}

export interface PixelHorizontalHookDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  curveIntensity?: number;
  strokeWidth?: number;
  strokeCount?: number;
  colorBleed?: number;
  segments?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawPixelHorizontalHook(p: p5, options: PixelHorizontalHookDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    curveIntensity = 0,
    strokeWidth = 0.25,
    strokeCount = 1,
    colorBleed = 0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  const pixelRenderer = getPixelRenderer();
  
  const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
  
  const pixelOptions: PixelStrokeOptions = {
    w,
    h,
    strokeWidth,
    strokeCount,
    colorBleed,
    baseColor: strokeColor,
    strokeType: 'h',
    curveIntensity,
    size,
    rotation
  };

  pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
}

export interface PixelLStrokeDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  strokeWidth?: number;
  strokeCount?: number;
  colorBleed?: number;
  segments?: number;
  upwardLength?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawPixelLStroke(p: p5, options: PixelLStrokeDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    strokeWidth = 0.25,
    strokeCount = 1,
    colorBleed = 0,
    upwardLength = 1.0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  const pixelRenderer = getPixelRenderer();
  
  const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
  
  const pixelOptions: PixelStrokeOptions = {
    w,
    h,
    strokeWidth,
    strokeCount,
    colorBleed,
    baseColor: strokeColor,
    strokeType: 'l',
    upwardLength,
    size,
    rotation
  };

  pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
}

export interface PixelVerticalHookDrawOptions {
  w: number;
  h: number;
  offsets: number[];
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  curveIntensity?: number;
  strokeWidth?: number;
  strokeCount?: number;
  colorBleed?: number;
  segments?: number;
  size?: number;
  rotation?: number;
  progress?: number;
}

export function drawPixelVerticalHook(p: p5, options: PixelVerticalHookDrawOptions) {
  const {
    w,
    h,
    offsets,
    saturations,
    colors,
    baseColor,
    curveIntensity = 0,
    strokeWidth = 0.25,
    strokeCount = 1,
    colorBleed = 0,
    size = 1.0,
    rotation = 0,
    progress = 1.0,
  } = options;

  const pixelRenderer = getPixelRenderer();
  
  const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
  
  const pixelOptions: PixelStrokeOptions = {
    w,
    h,
    strokeWidth,
    strokeCount,
    colorBleed,
    baseColor: strokeColor,
    strokeType: 'v',
    curveIntensity,
    size,
    rotation
  };

  pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
}

export interface PixelSolidRingDrawOptions {
  radius: number;
  width: number;
  saturations: { startAlpha: number; endAlpha: number }[];
  colors?: p5.Color[];
  baseColor: p5.Color;
  ringOpacity?: number;
  strokeWidth?: number;
  strokeCount?: number;
  colorBleed?: number;
  progress?: number;
}

export function drawPixelSolidRing(p: p5, options: PixelSolidRingDrawOptions) {
  const {
    radius,
    width,
    saturations,
    colors,
    baseColor,
    ringOpacity = 100,
    strokeWidth = 0.1,
    strokeCount = 1,
    colorBleed = 0,
    progress = 1.0,
  } = options;

  const pixelRenderer = getPixelRenderer();
  
  const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
  
  const pixelOptions: PixelStrokeOptions = {
    w: radius * 2,
    h: radius * 2,
    strokeWidth,
    strokeCount,
    colorBleed,
    baseColor: strokeColor,
    strokeType: '-',
    size: 1.0
  };

  pixelRenderer.renderStroke(p, pixelOptions, 0, 0, progress);
}
