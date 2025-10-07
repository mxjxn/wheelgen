# Release Guide

This guide explains how to create new releases of WheelGen with proper versioning.

## Quick Release Commands

### For Bug Fixes (Patch Release)
```bash
npm run release:patch
```
- Increments: `1.0.0` → `1.0.1`
- Use for: Bug fixes, small improvements

### For New Features (Minor Release)
```bash
npm run release:minor
```
- Increments: `1.0.0` → `1.1.0`
- Use for: New features, enhancements

### For Major Changes (Major Release)
```bash
npm run release:major
```
- Increments: `1.0.0` → `2.0.0`
- Use for: Breaking changes, major rewrites

## What These Commands Do

1. **Bump Version**: Updates `package.json` version number
2. **Create Git Tag**: Creates a version tag (e.g., `v1.0.1`)
3. **Build & Deploy**: Runs `npm run build` and deploys to GitHub Pages
4. **Push to GitHub**: Pushes the new version and tag to your repository

## Manual Release Process

If you prefer more control:

1. **Update CHANGELOG.md**:
   ```bash
   # Edit CHANGELOG.md to add your changes under [Unreleased]
   ```

2. **Bump Version**:
   ```bash
   npm version patch    # or minor/major
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Push with Tags**:
   ```bash
   git push --follow-tags
   ```

## Post-Release Checklist

After releasing:

1. ✅ Check that the live site updated correctly
2. ✅ Verify the new version tag exists on GitHub
3. ✅ Update your social media posts with the new version
4. ✅ Copy changelog items from `[Unreleased]` to the new version section

## Example Social Media Post

```
🎨 WheelGen v1.2.0 is live! 

✨ New Features:
- Enhanced color picker
- Improved mobile performance
- New stroke patterns

🐛 Bug Fixes:
- Fixed save system issue
- Better error handling

Try it now: https://mxjxn.github.io/wheelgen/
```

## Version History

Check `CHANGELOG.md` for a complete history of all releases and changes.
