-- Schema for Jeem Rishta Consultant (Production Version 1.0)
PRAGMA foreign_keys = ON;

-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'blocked')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Rishta Profiles (Main Matrimonial Record)
CREATE TABLE IF NOT EXISTS rishta_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT UNIQUE NOT NULL, -- Permanent public ID, e.g. JRC-10001
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_for TEXT NOT NULL CHECK(relationship_for IN ('Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Other Relative')),
    gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female')),
    age INTEGER NOT NULL CHECK(age >= 18 AND age <= 90),
    marital_status TEXT NOT NULL CHECK(marital_status IN ('Never Married', 'Divorced', 'Widowed')),
    religion TEXT NOT NULL,
    sect TEXT,
    education TEXT NOT NULL,
    custom_education TEXT,
    profession TEXT NOT NULL,
    city TEXT NOT NULL, -- Public city
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'blocked', 'removed', 'matched', 'closed', 'archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_profile_id ON rishta_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON rishta_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON rishta_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON rishta_profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON rishta_profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON rishta_profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_sect ON rishta_profiles(sect);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON rishta_profiles(age);

-- 3. Profile Family Details
CREATE TABLE IF NOT EXISTS profile_family_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT UNIQUE NOT NULL REFERENCES rishta_profiles(profile_id) ON DELETE CASCADE,
    father_guardian_name TEXT,
    mother_name TEXT,
    brothers_count INTEGER DEFAULT 0,
    sisters_count INTEGER DEFAULT 0,
    married_brothers_count INTEGER DEFAULT 0,
    married_sisters_count INTEGER DEFAULT 0,
    family_background TEXT
);

CREATE INDEX IF NOT EXISTS idx_family_profile_id ON profile_family_details(profile_id);

-- 4. Profile Private Details (STRICTLY PRIVATE: NEVER EXPOSED TO PUBLIC APIs)
CREATE TABLE IF NOT EXISTS profile_private_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT UNIQUE NOT NULL REFERENCES rishta_profiles(profile_id) ON DELETE CASCADE,
    guardian_contact_name TEXT NOT NULL,
    contact_mobile TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    country TEXT DEFAULT 'Pakistan',
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT,
    complete_address TEXT NOT NULL,
    other_private_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_private_profile_id ON profile_private_details(profile_id);

-- 5. Partner Requirements / Preferences
CREATE TABLE IF NOT EXISTS partner_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT UNIQUE NOT NULL REFERENCES rishta_profiles(profile_id) ON DELETE CASCADE,
    preferred_gender TEXT,
    preferred_min_age INTEGER,
    preferred_max_age INTEGER,
    preferred_religion TEXT,
    preferred_sect TEXT,
    preferred_marital_status TEXT,
    preferred_education TEXT,
    preferred_profession TEXT,
    preferred_city TEXT,
    other_requirements TEXT
);

CREATE INDEX IF NOT EXISTS idx_reqs_profile_id ON partner_requirements(profile_id);

-- 6. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin' CHECK(role IN ('superadmin', 'admin')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- 7. Configurable Admin Settings
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON admin_settings(setting_key);

-- 8. Admin Audit Activity Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER REFERENCES admin_users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
