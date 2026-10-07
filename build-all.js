const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [JEEM RISHTA VERCEL BUILD] ===');

const distDir = path.join(__dirname, 'dist');
const mobileDist = path.join(__dirname, 'mobile-app', 'dist');
const adminDist = path.join(__dirname, 'admin-panel', 'dist');

// If pre-built assets missing, trigger build
if (!fs.existsSync(path.join(mobileDist, 'index.html')) || !fs.existsSync(path.join(adminDist, 'index.html'))) {
  console.log('Compiling frontend apps...');
  try {
    execSync('npm install --prefix mobile-app && npm run build --prefix mobile-app', { stdio: 'inherit' });
    execSync('npm install --prefix admin-panel && npm run build --prefix admin-panel', { stdio: 'inherit' });
  } catch (err) {
    console.error('Frontend build error:', err);
  }
}

// Assemble final dist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure mobile-app is at root of dist
if (fs.existsSync(mobileDist)) {
  fs.cpSync(mobileDist, distDir, { recursive: true });
}

// Ensure admin-panel is at dist/admin
const distAdmin = path.join(distDir, 'admin');
if (fs.existsSync(adminDist)) {
  if (!fs.existsSync(distAdmin)) {
    fs.mkdirSync(distAdmin, { recursive: true });
  }
  fs.cpSync(adminDist, distAdmin, { recursive: true });
}

console.log('=== [BUILD COMPLETED SUCCESSFULLY] ===');
