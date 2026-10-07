# Jeem Rishta Consultant — Version 1.0

Production-ready, privacy-first matrimonial Android application, secure Node.js REST backend, and web-based Admin Management Panel.

---

## 🏗️ Architecture & Project Structure

```
d:\UMAR FAROOQ\jeem-rishta-consultant\
├── backend\                 # Production Node.js REST API
│   ├── src\
│   │   ├── config\          # Port, JWT keys, DB path, Superadmin defaults
│   │   ├── database\        # schema.sql, initDb.js, db.js, seed.js
│   │   ├── middleware\      # Auth guard, Admin guard, validation
│   │   ├── controllers\     # Strict public/private separation controllers
│   │   ├── routes\          # auth, profiles, admin, settings
│   │   └── utils\           # Profile ID generator (JRC-10001), audit logger
│   └── test\                # Automated API test suite
│
├── admin-panel\             # Web-based Admin Portal (React 18 + Vite + Tailwind)
│   ├── src\
│   │   ├── api\             # Admin API client with JWT interceptor
│   │   ├── components\      # Sidebar, Header, StatCards
│   │   └── pages\           # Dashboard, Profiles, Users, Settings, AuditLogs
│   └── dist\                # Optimized production build
│
├── mobile-app\              # Android Mobile Application (React + Vite + Capacitor)
│   ├── src\
│   │   ├── api\             # Mobile API client with dynamic WhatsApp launcher
│   │   ├── i18n\            # Centralized localization dictionary (en.json)
│   │   ├── components\      # BottomNav, TopHeader, ProfileCard
│   │   └── pages\           # Auth, Home, Search, AddRishta (7 steps), MyProfiles, Settings
│   ├── android\             # Native Android project (SDK 34, JDK 21, Gradle wrapper)
│   └── dist\                # Production mobile web bundle
│
└── store-assets\            # Google Play Store readiness
    ├── PLAY_STORE_LISTING.md
    ├── DATA_SAFETY.md
    ├── PRIVACY_POLICY.md
    ├── TERMS_AND_CONDITIONS.md
    └── BUILD_AND_SIGNING_GUIDE.md
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server
```powershell
cd "d:\UMAR FAROOQ\jeem-rishta-consultant\backend"
npm start
```
- API Base URL: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### 2. Start the Admin Web Portal
```powershell
cd "d:\UMAR FAROOQ\jeem-rishta-consultant\admin-panel"
npm run dev
```
- Admin URL: `http://localhost:5174`
- Default Superadmin Username: `superadmin`
- Default Password: `Admin@JeemRishta2026`

### 3. Start the Mobile Application Preview
```powershell
cd "d:\UMAR FAROOQ\jeem-rishta-consultant\mobile-app"
npm run dev
```
- Mobile App URL: `http://localhost:5173`
- Pre-seeded Test User: `03001112233` / `Pakistan@123`

---

## 🔒 Security & Privacy Features
1. **Public vs. Private Data Boundary**:
   - `profile_private_details` (mobile number, WhatsApp, full home address, guardian name) is **never** queried or returned by public API endpoints.
   - Normal users only see safe data (Gender, Age, City, Religion, Sect, Education, Profession, Family sibling counts).
2. **Consultant-Mediated Contact (WhatsApp)**:
   - No unmoderated user-to-user direct chat.
   - Tapping "Contact Admin" on any profile dynamically fetches the Admin's configured WhatsApp number from backend settings and pre-populates a professional inquiry message with the unique Profile ID (e.g. `JRC-10025`).
3. **Audit Logging**:
   - All administrative actions (logins, user blocks/unblocks, profile status modifications, and setting adjustments) are immutably logged with timestamps.
4. **Google Play Store Ready**:
   - Packaged with App ID `com.jeem.rishtaconsultant`, targeting SDK 34, requesting only the `INTERNET` permission, and supplied with Play Store Listing, Data Safety declaration, and Privacy Policy.
