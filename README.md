# Jeem Rishta Consultant — Live Matrimonial Platform

Production-ready, privacy-first matrimonial web application, secure Node.js REST API, and web-based Admin Management Panel. Fully configured and optimized for Vercel deployment.

---

## 🌐 Live URLs (Vercel)

- **🌍 Public Website (Main User Matrimonial Web):**  
  [https://jeem-rishta-consultant.vercel.app/](https://jeem-rishta-consultant.vercel.app/)  
  *Browse proposals, search profiles, view public details, contact admin via dynamic WhatsApp, and register proposals.*

- **🛡️ Admin Management Portal:**  
  [https://jeem-rishta-consultant.vercel.app/admin/](https://jeem-rishta-consultant.vercel.app/admin/)  
  *Platform dashboard, proposal moderation, user directory, system configuration, and audit logs.*

- **⚡ REST API Health Check:**  
  [https://jeem-rishta-consultant.vercel.app/api/health](https://jeem-rishta-consultant.vercel.app/api/health)

---

## 🔑 Login Credentials

### 1. Admin Portal (`/admin/`)
- **Username:** `superadmin`
- **Password:** `Admin@JeemRishta2026`

### 2. User Account (Public Web / App)
- **Mobile Number:** `03001112233`
- **Password:** `Pakistan@123`

---

## 🏗️ Architecture & Project Structure

```
Jeem-Rishta-Consultant/
├── dist/                     # Optimized static distribution bundle for Vercel
│   ├── index.html            # Main User Matrimonial Website (Root /)
│   ├── assets/               # User Website CSS/JS bundles
│   └── admin/                # Admin Management Portal (/admin/)
│       ├── index.html        # Admin Portal HTML
│       └── assets/           # Admin Portal CSS/JS bundles
│
├── api/                      # Vercel Serverless Functions REST API
│   ├── index.js              # Express API entrypoint
│   ├── jeem_rishta.db        # SQLite database bundle (pre-seeded with profiles & users)
│   ├── database/db.js        # Universal SQLite engine (better-sqlite3 + sql.js fallback)
│   ├── controllers/          # Public/Private separation controllers
│   ├── routes/               # API route definitions (/api/auth, /api/profiles, etc.)
│   └── middleware/           # JWT authentication and role guards
│
├── mobile-app/               # React 18 + Vite + Tailwind User Application source
├── admin-panel/              # React 18 + Vite + Tailwind Admin Portal source
├── build-all.js              # Automated build pipeline
├── vercel.json               # Vercel routing, rewrites, and headers config
└── package.json              # Project dependencies and deployment scripts
```

---

## 🔒 Security & Privacy Features
1. **Public vs. Private Data Boundary**: Guardian phone numbers, complete physical addresses, and WhatsApp contact numbers are strictly guarded and never exposed to public APIs.
2. **Consultant-Mediated WhatsApp Inquiries**: Users inquiry directly with the verified consultant via pre-filled WhatsApp templates referencing the unique Profile ID (e.g. `JRC-10001`).
3. **Admin Audit Logging**: Every administrative review, block, or modification action is logged.
