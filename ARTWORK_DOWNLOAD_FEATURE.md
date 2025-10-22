# Artwork Download Feature

## Overview

This feature adds comprehensive artwork download functionality to WheelGen, allowing users to export their generative art in multiple formats with customizable options.

## Features Implemented

### 🎨 **Download Formats**
- **PNG**: Lossless format, perfect for high-quality artwork
- **JPEG**: Compressed format, smaller file sizes with quality control

### ⚙️ **Download Options**
- **Quality Control**: Adjustable JPEG quality (10% - 100%)
- **Custom Filenames**: User-defined names with auto-timestamp fallback
- **Format Selection**: Choose between PNG and JPEG
- **File Size Estimation**: Real-time size estimates for different formats

### 🖱️ **Download Methods**
1. **Download Button**: Primary method with options panel
2. **Right-Click Save**: Browser's native "Save image as..." option
3. **Quick Download**: One-click PNG download

## UI Components

### Download Button Layout
```
┌─────────────────────────┐
│  Control Panel Button   │ ← top: 20px
│        (⚙️/🎨)          │
├─────────────────────────┤
│  Performance Monitor    │ ← top: 90px
│        Button (📊)      │
├─────────────────────────┤
│  Download Button        │ ← top: 160px
│        (💾)             │
└─────────────────────────┘
```

### Download Options Panel
- **Format Selection**: PNG vs JPEG toggle buttons
- **Quality Slider**: For JPEG compression (10% - 100%)
- **Filename Input**: Custom naming with placeholder
- **Canvas Info**: Dimensions and estimated file size
- **Download Button**: Confirms settings and downloads

## Technical Implementation

### Core Files
- `src/core/download-service.ts` - Download logic and utilities
- `src/components/DownloadButton.tsx` - UI component
- `src/styles/components/download-button.css` - Styling
- `src/core/p5-sketch.ts` - Right-click enablement

### Key Functions
```typescript
// Download as PNG (lossless)
DownloadService.downloadPNG(p, { filename: 'my-artwork' });

// Download as JPEG with quality control
DownloadService.downloadJPEG(p, { 
  quality: 0.9, 
  filename: 'compressed-artwork' 
});

// Get canvas information
const info = DownloadService.getCanvasInfo(p);
// Returns: { width, height, aspectRatio }
```

## Usage Instructions

### Quick Download
1. Click the green 💾 button for instant PNG download
2. File automatically named with timestamp

### Advanced Download
1. Click the ⚙️ button next to download button
2. Choose format (PNG/JPEG)
3. Adjust quality if using JPEG
4. Enter custom filename (optional)
5. Click "Download PNG/JPEG" button

### Right-Click Save
1. Right-click on the artwork canvas
2. Select "Save image as..." from browser menu
3. Choose location and filename

## Browser Compatibility

### Supported Features
- ✅ Canvas.toDataURL() - All modern browsers
- ✅ Programmatic download - All modern browsers
- ✅ Right-click context menu - All browsers
- ✅ Backdrop filters - Modern browsers (fallback provided)

### File Size Estimates
- **PNG**: ~1-3 bytes per pixel (lossless)
- **JPEG**: Variable based on quality setting
- **Typical sizes**: 
  - 1920×1080 PNG: ~2-6 MB
  - 1920×1080 JPEG (90%): ~200-800 KB

## Mobile Support

### Responsive Design
- **Button Size**: 50×50px on mobile (60×60px desktop)
- **Options Panel**: Full-width on mobile devices
- **Touch-Friendly**: Large touch targets and spacing
- **Positioning**: Maintains proper spacing below other buttons

## Error Handling

### Graceful Failures
- **No Canvas**: Shows error message in console
- **Download Blocked**: Browser security prevents download
- **Invalid Quality**: Automatically constrains to valid range
- **Filename Issues**: Falls back to auto-generated names

### User Feedback
- **Loading States**: Button shows ⏳ during download
- **Success Feedback**: Console logs successful downloads
- **Error Messages**: Clear error reporting in console

## Future Enhancements

### Potential Additions
- **SVG Export**: Vector format for scalable artwork
- **Batch Download**: Multiple formats at once
- **Social Sharing**: Direct sharing to social platforms
- **Print Optimization**: High-DPI versions for printing
- **Animation Export**: GIF/MP4 for animated pieces

### Performance Considerations
- **Large Canvases**: May need compression for very large images
- **Memory Usage**: Monitor canvas size vs available memory
- **Download Speed**: Consider compression for slow connections

## Testing Checklist

### Basic Functionality
- [ ] PNG download works
- [ ] JPEG download works with quality control
- [ ] Custom filenames work
- [ ] Auto-timestamp naming works
- [ ] Right-click save works

### UI/UX Testing
- [ ] Button positioning doesn't overlap other elements
- [ ] Options panel opens/closes properly
- [ ] Mobile responsive design works
- [ ] Loading states display correctly
- [ ] Error handling works gracefully

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## Integration Notes

### Existing Systems
- **Compatible with**: Pixel rendering system, performance monitor
- **Uses**: Existing p5.js canvas instance
- **Styling**: Consistent with app design system
- **State Management**: No additional state required

### Performance Impact
- **Minimal**: Download only triggers on user action
- **Memory**: Temporary link creation, immediately cleaned up
- **CPU**: Canvas.toDataURL() is browser-optimized
- **Network**: Only local download, no server requests

This implementation provides a robust, user-friendly way to export artwork while maintaining the existing app's performance and design consistency.
