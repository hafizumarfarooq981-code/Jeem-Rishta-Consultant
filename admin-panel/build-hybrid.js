import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== [ADMIN PANEL VERCEL HYBRID STEP] ===');

const distDir = path.join(__dirname, 'dist');
const adminDir = path.join(distDir, 'admin');

// 1. Move Vite admin build into dist/admin/
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

const adminIndex = path.join(distDir, 'index.html');
const adminIndexDest = path.join(adminDir, 'index.html');
if (fs.existsSync(adminIndex)) {
  fs.copyFileSync(adminIndex, adminIndexDest);
}

const adminAssets = path.join(distDir, 'assets');
const adminAssetsDest = path.join(adminDir, 'assets');
if (fs.existsSync(adminAssets)) {
  if (!fs.existsSync(adminAssetsDest)) fs.mkdirSync(adminAssetsDest, { recursive: true });
  fs.cpSync(adminAssets, adminAssetsDest, { recursive: true });
}

// 2. Put main matrimonial website (mobile-app) into root dist/
const mobileDist = fs.existsSync(path.join(__dirname, 'mobile-dist'))
  ? path.join(__dirname, 'mobile-dist')
  : path.join(__dirname, '..', 'mobile-app', 'dist');

if (fs.existsSync(mobileDist)) {
  fs.cpSync(mobileDist, distDir, { recursive: true });
  console.log('✔ Matrimonial website deployed to root /');
  console.log('✔ Admin portal deployed to /admin/');
} else {
  console.warn('⚠ mobileDist not found');
}

console.log('=== [HYBRID STEP COMPLETE] ===');
