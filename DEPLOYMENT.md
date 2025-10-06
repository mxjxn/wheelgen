# GitHub Pages Deployment Guide

This project is configured to deploy automatically to GitHub Pages at `https://wheelgen.github.io/wheelgen/`.

## Setup Instructions

### 1. Repository Setup
1. Create a GitHub repository named `wheelgen`
2. Push your code to the `main` branch
3. Go to your repository settings → Pages
4. Set source to "GitHub Actions"

### 2. Automatic Deployment
The project uses GitHub Actions for automatic deployment:
- **Workflow file**: `.github/workflows/deploy.yml`
- **Triggers**: Pushes to `main` branch
- **Build output**: `dist/` directory
- **Base path**: `/wheelgen/` (configured in `vite.config.ts`)

### 3. Manual Deployment (Alternative)
If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Configuration Details

### Vite Configuration
- **Base path**: Set to `/wheelgen/` for GitHub Pages compatibility
- **Build output**: Single file build using `vite-plugin-singlefile`
- **Framework**: SolidJS with TypeScript

### GitHub Actions Workflow
- **Node.js version**: 18
- **Build command**: `npm run build`
- **Deploy directory**: `./dist`
- **Deploy trigger**: Only on `main` branch pushes

## URL Structure
- **Live site**: `https://wheelgen.github.io/wheelgen/`
- **Repository**: `https://github.com/wheelgen/wheelgen`

## Troubleshooting

### Common Issues
1. **404 errors**: Ensure the base path is correctly set to `/wheelgen/`
2. **Build failures**: Check that all dependencies are properly installed
3. **Deployment not triggering**: Verify the workflow file is in `.github/workflows/`

### Local Testing
Test the build locally before deploying:
```bash
npm run build
npm run preview
```

## Notes
- The project uses a single-file build for optimal GitHub Pages performance
- All assets are bundled into a single HTML file
- The site is optimized for fast loading and offline functionality
