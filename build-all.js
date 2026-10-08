import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== [JEEM RISHTA VERCEL PACKAGER] ===');

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 1. Matrimonial user website at root /
const mobileDistOptions = [
  path.join(__dirname, 'mobile-app', 'dist'),
  path.join(__dirname, 'admin-panel', 'mobile-dist')
];

let mobileDist = mobileDistOptions.find(p => fs.existsSync(p));
if (mobileDist) {
  fs.cpSync(mobileDist, distDir, { recursive: true });
  fs.cpSync(mobileDist, publicDir, { recursive: true });
  console.log('✔ Matrimonial website deployed to root /');
} else {
  console.warn('⚠ mobileDist not found');
}

// 2. Admin portal at /admin/
const distAdmin = path.join(distDir, 'admin');
const publicAdmin = path.join(publicDir, 'admin');
if (!fs.existsSync(distAdmin)) fs.mkdirSync(distAdmin, { recursive: true });
if (!fs.existsSync(publicAdmin)) fs.mkdirSync(publicAdmin, { recursive: true });

const adminDistOptions = [
  path.join(__dirname, 'admin-panel', 'dist', 'admin'),
  path.join(__dirname, 'admin-panel', 'dist-admin-backup'),
  path.join(__dirname, 'admin-panel', 'dist')
];

let adminDist = adminDistOptions.find(p => fs.existsSync(p));
if (adminDist) {
  // If the admin dist is the whole dist containing admin subfolder
  if (fs.existsSync(path.join(adminDist, 'index.html'))) {
    fs.cpSync(adminDist, distAdmin, { recursive: true });
    fs.cpSync(adminDist, publicAdmin, { recursive: true });
    console.log('✔ Admin portal deployed to /admin/');
  }
}

console.log('=== [PACKAGING COMPLETED SUCCESSFULLY] ===');
