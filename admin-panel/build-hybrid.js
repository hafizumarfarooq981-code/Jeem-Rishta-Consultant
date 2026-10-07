import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const adminDir = path.join(distDir, 'admin');

console.log('=== [ADMIN PANEL POST-BUILD HYBRID STEP] ===');

// 1. Move admin build files into dist/admin/
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

const adminIndex = path.join(distDir, 'index.html');
if (fs.existsSync(adminIndex)) {
  fs.cpSync(adminIndex, path.join(adminDir, 'index.html'));
}

const adminAssets = path.join(distDir, 'assets');
if (fs.existsSync(adminAssets)) {
  const adminAssetsDest = path.join(adminDir, 'assets');
  if (!fs.existsSync(adminAssetsDest)) fs.mkdirSync(adminAssetsDest, { recursive: true });
  fs.cpSync(adminAssets, adminAssetsDest, { recursive: true });
}

// 2. Put main matrimonial website at root of dist/
let mobileDist = path.join(__dirname, 'mobile-dist');
if (!fs.existsSync(mobileDist)) {
  mobileDist = path.join(__dirname, '..', 'mobile-app', 'dist');
}

if (fs.existsSync(mobileDist)) {
  fs.cpSync(path.join(mobileDist, 'index.html'), path.join(distDir, 'index.html'));
  fs.cpSync(path.join(mobileDist, 'assets'), path.join(distDir, 'assets'), { recursive: true });
  console.log('✔ Matrimonial website deployed to root /');
  console.log('✔ Admin portal deployed to /admin/');
} else {
  console.warn('⚠ mobileDist not found, admin remains at root');
}

console.log('=== [HYBRID BUILD COMPLETED] ===');
