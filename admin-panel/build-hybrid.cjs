const fs = require('fs');
const path = require('path');

console.log('=== [ADMIN PANEL VERCEL HYBRID PACKAGER] ===');

const distDir = path.join(__dirname, 'dist');
const adminDir = path.join(distDir, 'admin');

if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

// 1. Ensure admin assets and index are in dist/admin/
// Check if admin dist has original admin index.html
const adminOrigIndex = path.join(__dirname, 'dist-admin-backup', 'index.html');
if (fs.existsSync(adminOrigIndex)) {
  fs.copyFileSync(adminOrigIndex, path.join(adminDir, 'index.html'));
}

// Check admin assets
const adminOrigAssets = path.join(__dirname, 'dist-admin-backup', 'assets');
if (fs.existsSync(adminOrigAssets)) {
  fs.cpSync(adminOrigAssets, path.join(adminDir, 'assets'), { recursive: true });
}

// 2. Ensure mobile-app (Matrimonial Website) is at root dist/
const mobileDist = fs.existsSync(path.join(__dirname, 'mobile-dist'))
  ? path.join(__dirname, 'mobile-dist')
  : path.join(__dirname, '..', 'mobile-app', 'dist');

if (fs.existsSync(mobileDist)) {
  fs.cpSync(mobileDist, distDir, { recursive: true });
  console.log('✔ Matrimonial website deployed to root /');
  console.log('✔ Admin portal deployed to /admin/');
}

console.log('=== [PACKAGING COMPLETED SUCCESSFULLY] ===');
