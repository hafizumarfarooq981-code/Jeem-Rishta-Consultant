const fs = require('fs');
const path = require('path');

console.log('=== [JEEM RISHTA VERCEL ROOT PACKAGER] ===');

const distDir = path.join(__dirname, 'dist');
const mobileDist = path.join(__dirname, 'mobile-app', 'dist');
const adminDist = path.join(__dirname, 'admin-panel', 'dist-admin-backup');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Matrimonial user website at root /
if (fs.existsSync(mobileDist)) {
  fs.cpSync(mobileDist, distDir, { recursive: true });
  console.log('✔ Matrimonial website deployed to root /');
}

// 2. Admin portal at /admin/
const distAdmin = path.join(distDir, 'admin');
if (!fs.existsSync(distAdmin)) {
  fs.mkdirSync(distAdmin, { recursive: true });
}

if (fs.existsSync(adminDist)) {
  fs.cpSync(adminDist, distAdmin, { recursive: true });
  console.log('✔ Admin portal deployed to /admin/');
}

console.log('=== [ROOT PACKAGING COMPLETED SUCCESSFULLY] ===');
