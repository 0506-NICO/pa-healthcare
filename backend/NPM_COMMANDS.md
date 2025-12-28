# 📦 NPM Scripts Reference

## Available Commands

### Development
```bash
npm run dev
```
Starts development server with nodemon (auto-restart on file changes)

### Production
```bash
npm start
```
Starts production server

### Testing
```bash
npm test
```
Run tests with Jest

### Linting
```bash
npm run lint
```
Check code quality with ESLint

### Security Audit
```bash
npm run security-check
```
Run npm audit and snyk security scan

---

## Installation

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install as dev dependency
npm install --save-dev package-name

# Update packages
npm update

# Check outdated packages
npm outdated
```

---

## Useful Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall all packages
rm -rf node_modules package-lock.json
npm install

# Check Node/NPM versions
node --version
npm --version

# List installed packages
npm list --depth=0

# Run specific script
npm run script-name
```
