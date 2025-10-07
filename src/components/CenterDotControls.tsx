import { Component, createSignal, createEffect } from 'solid-js';
import { 
  hasChanges, 
  setHasChanges,
  innerDot,
  setInnerDot
} from '../store/artwork';
import '../styles/components/center-dot-controls.css';

// Props interface
interface CenterDotControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

export const CenterDotControls: Component<CenterDotControlsProps> = (props) => {
  // Inner dot controls
  const [innerDotVisible, setInnerDotVisible] = createSignal(innerDot().visible);
  const [innerDotRadius, setInnerDotRadius] = createSignal(innerDot().radius);
  const [innerDotColor1Index, setInnerDotColor1Index] = createSignal(innerDot().color1Index);
  const [innerDotColor2Index, setInnerDotColor2Index] = createSignal(innerDot().color2Index);
  const [innerDotGradientStop, setInnerDotGradientStop] = createSignal(innerDot().gradientStop);
  const [innerDotMaxRadius, setInnerDotMaxRadius] = createSignal(innerDot().maxRadius);

  // Update local signals when store changes
  createEffect(() => {
    const currentInnerDot = innerDot();
    setInnerDotVisible(currentInnerDot.visible);
    setInnerDotRadius(currentInnerDot.radius);
    setInnerDotColor1Index(currentInnerDot.color1Index);
    setInnerDotColor2Index(currentInnerDot.color2Index);
    setInnerDotGradientStop(currentInnerDot.gradientStop);
    setInnerDotMaxRadius(currentInnerDot.maxRadius);
  });

  return (
    <div class="center-dot-controls">
      <div class="center-dot-header">
        <h3 class="section-title">Center Dot</h3>
        <p class="section-description">Control the appearance and behavior of the center dot</p>
      </div>
      
      {/* Visibility Toggle */}
      <label class="guides-checkbox">
        <input
          type="checkbox"
          checked={innerDotVisible()}
          onChange={(e) => {
            setInnerDotVisible(e.target.checked);
            setInnerDot({ ...innerDot(), visible: e.target.checked });
            setHasChanges(true);
            props.requestRedraw();
          }}
        />
        Show Center Dot
      </label>

      {innerDotVisible() && (
        <>
          {/* Radius Control */}
          <div class="control-section">
            <label class="control-label">Radius</label>
            <input
              type="range"
              min="0"
              max={innerDotMaxRadius()}
              step="0.1"
              value={innerDotRadius()}
              onInput={(e) => {
                const value = parseFloat(e.target.value);
                setInnerDotRadius(value);
                setInnerDot({ ...innerDot(), radius: value });
                setHasChanges(true);
                props.requestRedraw();
              }}
              class="control-range"
            />
            <div class="control-description">
              <small>{innerDotRadius().toFixed(1)} / {innerDotMaxRadius().toFixed(1)}</small>
            </div>
          </div>

          {/* Max Radius Control */}
          <div class="control-section">
            <label class="control-label">Max Radius</label>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={innerDotMaxRadius()}
              onInput={(e) => {
                const value = parseFloat(e.target.value);
                setInnerDotMaxRadius(value);
                setInnerDot({ ...innerDot(), maxRadius: value });
                // Adjust current radius if it exceeds new max
                if (innerDotRadius() > value) {
                  setInnerDotRadius(value);
                  setInnerDot({ ...innerDot(), radius: value, maxRadius: value });
                } else {
                  setInnerDot({ ...innerDot(), maxRadius: value });
                }
                setHasChanges(true);
                props.requestRedraw();
              }}
              class="control-range"
            />
            <div class="control-description">
              <small>{innerDotMaxRadius().toFixed(1)}</small>
            </div>
          </div>

          {/* Color 1 Index */}
          <div class="control-section">
            <label class="control-label">Color 1 Index</label>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={innerDotColor1Index()}
              onInput={(e) => {
                const value = parseInt(e.target.value);
                setInnerDotColor1Index(value);
                setInnerDot({ ...innerDot(), color1Index: value });
                setHasChanges(true);
                props.requestRedraw();
              }}
              class="control-range"
            />
            <div class="control-description">
              <small>Palette Color {innerDotColor1Index()}</small>
            </div>
          </div>

          {/* Color 2 Index */}
          <div class="control-section">
            <label class="control-label">Color 2 Index</label>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={innerDotColor2Index()}
              onInput={(e) => {
                const value = parseInt(e.target.value);
                setInnerDotColor2Index(value);
                setInnerDot({ ...innerDot(), color2Index: value });
                setHasChanges(true);
                props.requestRedraw();
              }}
              class="control-range"
            />
            <div class="control-description">
              <small>Palette Color {innerDotColor2Index()}</small>
            </div>
          </div>

          {/* Gradient Stop */}
          <div class="control-section">
            <label class="control-label">Gradient Stop</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={innerDotGradientStop()}
              onInput={(e) => {
                const value = parseFloat(e.target.value);
                setInnerDotGradientStop(value);
                setInnerDot({ ...innerDot(), gradientStop: value });
                setHasChanges(true);
                props.requestRedraw();
              }}
              class="control-range"
            />
            <div class="control-description">
              <small>{(innerDotGradientStop() * 100).toFixed(0)}%</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
