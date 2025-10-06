# WheelGen

A generative art studio that creates beautiful concentric ring patterns using calligraphic strokes and a custom grammar system.

![WheelGen Demo](https://img.shields.io/badge/Live%20Demo-wheelgen.github.io-blue?style=for-the-badge&logo=github)

## ✨ Features

- **Interactive Controls**: Real-time manipulation of ring patterns, colors, and stroke styles
- **Custom Grammar System**: Procedural generation using calligraphic alphabet elements
- **Color Management**: Advanced color palette system with HSL controls
- **Save System**: 3x3 slot grid with autosave functionality
- **Performance Optimized**: Smooth 60fps rendering with deferred rendering system
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🎨 Art Elements

- **Calligraphic Strokes**: Diamond, L-stroke, V-hook, H-hook, and solid ring patterns
- **Concentric Rings**: Layered ring system with customizable spacing and rotation
- **Color Palettes**: HSL-based color management with real-time preview
- **Particle Effects**: Dynamic particle systems for enhanced visual appeal

## 🚀 Live Demo

**[Try WheelGen →](https://mxjxn.github.io/wheelgen/)**

## 🛠️ Tech Stack

- **Frontend**: SolidJS + TypeScript
- **Graphics**: p5.js
- **Build Tool**: Vite
- **Deployment**: GitHub Pages
- **Styling**: CSS3 with custom component architecture

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/mxjxn/wheelgen.git
cd wheelgen

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎮 Usage

1. **Create Patterns**: Use the ring controls to adjust spacing, rotation, and count
2. **Customize Colors**: Modify HSL values and stroke colors in real-time
3. **Save Artwork**: Use the 3x3 slot grid to save and load your creations
4. **Export**: Download your artwork as high-resolution images

## 🏗️ Development

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to GitHub Pages
```

## 📁 Project Structure

```
src/
├── components/          # React/SolidJS components
├── core/               # Core rendering and color logic
├── model/              # Data models and types
└── store/              # State management
```

## 🎯 Key Components

- **App.tsx**: Main application container
- **RingsControls.tsx**: Ring pattern controls
- **ColorManagementPanel.tsx**: Color palette management
- **SaveSlotGrid.tsx**: Save/load system
- **PerformanceMonitor.tsx**: Real-time performance metrics

## 🌐 Deployment

This project automatically deploys to GitHub Pages via GitHub Actions. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**MXJXN** - [GitHub](https://github.com/mxjxn)

---

*Create beautiful generative art with WheelGen - where mathematics meets calligraphy.*