import { getPixelRenderer } from './pixel-renderer';
export function drawPixelDiamond(p, options) {
    const { w, h, offsets, saturations, colors, baseColor, strokeWidth = 0.25, strokeCount = 1, colorBleed = 0, length = 1.0, size = 1.0, rotation = 0, progress = 1.0, } = options;
    const pixelRenderer = getPixelRenderer();
    // Use the first color for the base stroke, or baseColor if no colors provided
    const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
    const pixelOptions = {
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
export function drawPixelHorizontalHook(p, options) {
    const { w, h, offsets, saturations, colors, baseColor, curveIntensity = 0, strokeWidth = 0.25, strokeCount = 1, colorBleed = 0, size = 1.0, rotation = 0, progress = 1.0, } = options;
    const pixelRenderer = getPixelRenderer();
    const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
    const pixelOptions = {
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
export function drawPixelLStroke(p, options) {
    const { w, h, offsets, saturations, colors, baseColor, strokeWidth = 0.25, strokeCount = 1, colorBleed = 0, upwardLength = 1.0, size = 1.0, rotation = 0, progress = 1.0, } = options;
    const pixelRenderer = getPixelRenderer();
    const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
    const pixelOptions = {
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
export function drawPixelVerticalHook(p, options) {
    const { w, h, offsets, saturations, colors, baseColor, curveIntensity = 0, strokeWidth = 0.25, strokeCount = 1, colorBleed = 0, size = 1.0, rotation = 0, progress = 1.0, } = options;
    const pixelRenderer = getPixelRenderer();
    const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
    const pixelOptions = {
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
export function drawPixelSolidRing(p, options) {
    const { radius, width, saturations, colors, baseColor, ringOpacity = 100, strokeWidth = 0.1, strokeCount = 1, colorBleed = 0, progress = 1.0, } = options;
    const pixelRenderer = getPixelRenderer();
    const strokeColor = colors && colors.length > 0 ? colors[0] : baseColor;
    const pixelOptions = {
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
