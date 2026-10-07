const db = require('./db');
const { initDb } = require('./initDb');
const { hashPassword } = require('../utils/password');

function seedDatabase() {
  initDb();
  console.log('[Seed] Seeding sample Pakistani matrimonial profiles...');

  // 1. Create sample test users
  const testUsers = [
    { mobile: '03001112233', pass: 'Pakistan@123' },
    { mobile: '03014445566', pass: 'Pakistan@123' },
    { mobile: '03027778899', pass: 'Pakistan@123' },
    { mobile: '03031234567', pass: 'Pakistan@123' },
    { mobile: '03049876543', pass: 'Pakistan@123' }
  ];

  const userIds = [];
  for (const u of testUsers) {
    const existing = db.prepare('SELECT id FROM users WHERE mobile_number = ?').get(u.mobile);
    if (!existing) {
      const res = db.prepare("INSERT INTO users (mobile_number, password_hash, status) VALUES (?, ?, 'active')")
        .run(u.mobile, hashPassword(u.pass));
      userIds.push(res.lastInsertRowid);
    } else {
      userIds.push(existing.id);
    }
  }

  // Check if profiles already exist
  const count = db.prepare('SELECT COUNT(*) as count FROM rishta_profiles').get().count;
  if (count >= 10) {
    console.log(`[Seed] Already ${count} profiles present. Skipping sample profile creation.`);
    return;
  }

  const sampleProfiles = [
    {
      userIndex: 0,
      id: 'JRC-10001',
      relation: 'My Daughter',
      gender: 'Female',
      age: 25,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Sunni',
      education: 'Master',
      profession: 'High School Teacher',
      city: 'Sahiwal',
      family: {
        father: 'Muhammad Aslam (Late)',
        mother: 'Parveen Akhtar',
        brothers: 2,
        sisters: 1,
        mBrothers: 1,
        mSisters: 0,
        bg: 'Respectable Arain family from Sahiwal. Father was a retired civil servant. Simple and religious family background.'
      },
      private: {
        contact_name: 'Muhammad Tariq (Elder Brother)',
        contact_mobile: '03001112233',
        whatsapp: '03001112233',
        province: 'Punjab',
        city: 'Sahiwal',
        area: 'Farid Town',
        address: 'House 42-B, Street 7, Farid Town, Sahiwal',
        notes: 'Family prefers proposals from educated families in Punjab.'
      },
      reqs: {
        gender: 'Male',
        min_age: 26,
        max_age: 31,
        religion: 'Muslim',
        sect: 'Sunni',
        marital: 'Never Married',
        edu: 'Master',
        prof: 'Government Officer or Software Engineer',
        city: 'Lahore, Sahiwal, Multan',
        other: 'Groom should be well-settled, religious, and non-smoker with decent family background.'
      }
    },
    {
      userIndex: 0,
      id: 'JRC-10002',
      relation: 'My Son',
      gender: 'Male',
      age: 28,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Sunni',
      education: 'Bachelor',
      profession: 'Software Engineer',
      city: 'Lahore',
      family: {
        father: 'Sheikh Abdul Rasheed',
        mother: 'Farzana Kausar',
        brothers: 1,
        sisters: 2,
        mBrothers: 0,
        mSisters: 1,
        bg: 'Sheikh family residing in Gulberg Lahore for 30 years. Own house and business.'
      },
      private: {
        contact_name: 'Sheikh Abdul Rasheed (Father)',
        contact_mobile: '03009988771',
        whatsapp: '03009988771',
        province: 'Punjab',
        city: 'Lahore',
        area: 'Gulberg III',
        address: 'Plot 15, Block B, Gulberg III, Lahore',
        notes: 'Looking for prompt response.'
      },
      reqs: {
        gender: 'Female',
        min_age: 22,
        max_age: 26,
        religion: 'Muslim',
        sect: 'Sunni',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Any / Homemaker',
        city: 'Lahore',
        other: 'Educated, family-oriented, polite, well-mannered daughter from a noble family.'
      }
    },
    {
      userIndex: 1,
      id: 'JRC-10003',
      relation: 'Myself',
      gender: 'Male',
      age: 32,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Deobandi',
      education: 'Master',
      profession: 'Chartered Accountant',
      city: 'Karachi',
      family: {
        father: 'Haji Noor Muhammad',
        mother: 'Zubaida Begum',
        brothers: 2,
        sisters: 2,
        mBrothers: 2,
        mSisters: 2,
        bg: 'Memon business community family based in Karachi. Religious and traditional values.'
      },
      private: {
        contact_name: 'Haji Noor Muhammad',
        contact_mobile: '03218765432',
        whatsapp: '03218765432',
        province: 'Sindh',
        city: 'Karachi',
        area: 'PECHS Block 2',
        address: 'Bungalow 78, PECHS Block 2, Karachi',
        notes: 'Looking for religious family.'
      },
      reqs: {
        gender: 'Female',
        min_age: 24,
        max_age: 29,
        religion: 'Muslim',
        sect: 'Deobandi',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Teacher / Homemaker',
        city: 'Karachi',
        other: 'Religious minded, observes Hijab, modest, caring character.'
      }
    },
    {
      userIndex: 1,
      id: 'JRC-10004',
      relation: 'My Sister',
      gender: 'Female',
      age: 27,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Barelvi',
      education: 'MPhil',
      profession: 'Lecturer in Chemistry',
      city: 'Faisalabad',
      family: {
        father: 'Malik Zulfiqar Ali',
        mother: 'Shahida Perveen',
        brothers: 1,
        sisters: 2,
        mBrothers: 1,
        mSisters: 1,
        bg: 'Noble Awan family settled in Faisalabad. Educated and respected background.'
      },
      private: {
        contact_name: 'Malik Zulfiqar Ali (Father)',
        contact_mobile: '03017778899',
        whatsapp: '03017778899',
        province: 'Punjab',
        city: 'Faisalabad',
        area: 'Madina Town',
        address: 'House 112, Susan Road, Madina Town, Faisalabad',
        notes: 'Strictly looking for educated groom.'
      },
      reqs: {
        gender: 'Male',
        min_age: 28,
        max_age: 33,
        religion: 'Muslim',
        sect: 'Barelvi',
        marital: 'Never Married',
        edu: 'Master',
        prof: 'Lecturer, Engineer, or Banker',
        city: 'Faisalabad, Lahore, Islamabad',
        other: 'Highly educated, cultured family, settled in government or reputable private sector.'
      }
    },
    {
      userIndex: 2,
      id: 'JRC-10005',
      relation: 'My Son',
      gender: 'Male',
      age: 30,
      marital_status: 'Divorced',
      religion: 'Muslim',
      sect: 'Sunni',
      education: 'PhD',
      profession: 'Data Scientist',
      city: 'Islamabad',
      family: {
        father: 'Dr. Iftikhar Ahmad',
        mother: 'Dr. Samina Iftikhar',
        brothers: 1,
        sisters: 1,
        mBrothers: 1,
        mSisters: 1,
        bg: 'Both parents are PhD professors. Liberal yet cultured Pakistani family.'
      },
      private: {
        contact_name: 'Dr. Iftikhar Ahmad (Father)',
        contact_mobile: '03335554433',
        whatsapp: '03335554433',
        province: 'Federal Capital',
        city: 'Islamabad',
        area: 'Sector F-7/2',
        address: 'Street 33, Sector F-7/2, Islamabad',
        notes: 'Divorce was mutual after short marriage of 4 months. No children.'
      },
      reqs: {
        gender: 'Female',
        min_age: 24,
        max_age: 30,
        religion: 'Muslim',
        sect: 'Sunni',
        marital: 'Never Married',
        edu: 'Master',
        prof: 'Professional / Career Oriented',
        city: 'Islamabad, Rawalpindi, Lahore',
        other: 'Broad minded, empathetic, mature personality.'
      }
    },
    {
      userIndex: 2,
      id: 'JRC-10006',
      relation: 'My Daughter',
      gender: 'Female',
      age: 24,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Ahl-e-Hadith',
      education: 'Bachelor',
      profession: 'Doctor (MBBS)',
      city: 'Multan',
      family: {
        father: 'Rao Muhammad Rafiq',
        mother: 'Nasreen Akhtar',
        brothers: 2,
        sisters: 0,
        mBrothers: 0,
        mSisters: 0,
        bg: 'Rajput family from Multan. Agriculture landholders and business owners.'
      },
      private: {
        contact_name: 'Rao Muhammad Rafiq (Father)',
        contact_mobile: '03026665544',
        whatsapp: '03026665544',
        province: 'Punjab',
        city: 'Multan',
        area: 'Bosan Road',
        address: 'Officers Colony, Bosan Road, Multan',
        notes: 'Prefers Doctor groom.'
      },
      reqs: {
        gender: 'Male',
        min_age: 26,
        max_age: 30,
        religion: 'Muslim',
        sect: 'Ahl-e-Hadith',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Doctor (MBBS / FCPS)',
        city: 'Multan, Lahore, Bahawalpur',
        other: 'Doctor boy preferred. Strict Islamic adherence.'
      }
    },
    {
      userIndex: 3,
      id: 'JRC-10007',
      relation: 'My Brother',
      gender: 'Male',
      age: 29,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Shia',
      education: 'Master',
      profession: 'Civil Engineer',
      city: 'Rawalpindi',
      family: {
        father: 'Syed Baqir Hussain',
        mother: 'Syeda Batool Zahra',
        brothers: 2,
        sisters: 1,
        mBrothers: 1,
        mSisters: 1,
        bg: 'Respectable Syed family rooted in Rawalpindi / Chakwal.'
      },
      private: {
        contact_name: 'Syed Ali Raza (Elder Brother)',
        contact_mobile: '03125556677',
        whatsapp: '03125556677',
        province: 'Punjab',
        city: 'Rawalpindi',
        area: 'Westridge',
        address: 'House 89, Peshawar Road, Westridge, Rawalpindi',
        notes: 'Syed proposal preferred.'
      },
      reqs: {
        gender: 'Female',
        min_age: 22,
        max_age: 27,
        religion: 'Muslim',
        sect: 'Shia',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Any',
        city: 'Rawalpindi, Islamabad',
        other: 'Syeda girl preferred, polite and religious family.'
      }
    },
    {
      userIndex: 3,
      id: 'JRC-10008',
      relation: 'My Sister',
      gender: 'Female',
      age: 26,
      marital_status: 'Never Married',
      religion: 'Christian',
      sect: 'Other',
      education: 'Bachelor',
      profession: 'Bank Officer',
      city: 'Lahore',
      family: {
        father: 'Victor Masih',
        mother: 'Stella Victor',
        brothers: 1,
        sisters: 2,
        mBrothers: 0,
        mSisters: 1,
        bg: 'Peaceful and educated Christian family in Lahore.'
      },
      private: {
        contact_name: 'Victor Masih (Father)',
        contact_mobile: '03459998811',
        whatsapp: '03459998811',
        province: 'Punjab',
        city: 'Lahore',
        area: 'Model Town',
        address: 'Street 4, Model Town Extension, Lahore',
        notes: 'Christian community proposals only.'
      },
      reqs: {
        gender: 'Male',
        min_age: 27,
        max_age: 32,
        religion: 'Christian',
        sect: 'Other',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Corporate or Banking',
        city: 'Lahore, Islamabad',
        other: 'Well-settled Christian gentleman from decent family.'
      }
    },
    {
      userIndex: 4,
      id: 'JRC-10009',
      relation: 'Other Relative',
      gender: 'Male',
      age: 35,
      marital_status: 'Widowed',
      religion: 'Muslim',
      sect: 'Sunni',
      education: 'Master',
      profession: 'Bank Branch Manager',
      city: 'Peshawar',
      family: {
        father: 'Khanzada Sher Khan',
        mother: 'Gul Meena',
        brothers: 3,
        sisters: 1,
        mBrothers: 2,
        mSisters: 1,
        bg: 'Respectable Pashtun family from Peshawar. Traditional values.'
      },
      private: {
        contact_name: 'Sher Khan (Father)',
        contact_mobile: '03348887722',
        whatsapp: '03348887722',
        province: 'KPK',
        city: 'Peshawar',
        area: 'Hayatabad Phase 3',
        address: 'Sector F2, Hayatabad, Peshawar',
        notes: 'Wife passed away 2 years ago. One 5-year-old son.'
      },
      reqs: {
        gender: 'Female',
        min_age: 26,
        max_age: 34,
        religion: 'Muslim',
        sect: 'Sunni',
        marital: 'Any',
        edu: 'Intermediate',
        prof: 'Homemaker',
        city: 'Peshawar, Islamabad, Rawalpindi',
        other: 'Kind-hearted woman who will care for a motherless child with love.'
      }
    },
    {
      userIndex: 4,
      id: 'JRC-10010',
      relation: 'My Daughter',
      gender: 'Female',
      age: 23,
      marital_status: 'Never Married',
      religion: 'Muslim',
      sect: 'Sunni',
      education: 'Bachelor',
      profession: 'Graphic Designer',
      city: 'Gujranwala',
      family: {
        father: 'Mian Tariq Mehmood',
        mother: 'Kausar Parveen',
        brothers: 1,
        sisters: 1,
        mBrothers: 0,
        mSisters: 0,
        bg: 'Industrialist family settled in Gujranwala with own manufacturing unit.'
      },
      private: {
        contact_name: 'Mian Tariq Mehmood (Father)',
        contact_mobile: '03004443322',
        whatsapp: '03004443322',
        province: 'Punjab',
        city: 'Gujranwala',
        area: 'DC Colony',
        address: 'Bungalow 4, Road 2, DC Colony, Gujranwala',
        notes: 'Business family preferred.'
      },
      reqs: {
        gender: 'Male',
        min_age: 25,
        max_age: 29,
        religion: 'Muslim',
        sect: 'Sunni',
        marital: 'Never Married',
        edu: 'Bachelor',
        prof: 'Business Owner or Industrialist',
        city: 'Gujranwala, Lahore, Sialkot',
        other: 'Well-established business family with modern outlook and religious ethics.'
      }
    }
  ];

  const seedTx = db.transaction(() => {
    for (const p of sampleProfiles) {
      const uId = userIds[p.userIndex] || userIds[0];

      // 1. Profile
      db.prepare(`
        INSERT OR REPLACE INTO rishta_profiles (
          profile_id, user_id, relationship_for, gender, age,
          marital_status, religion, sect, education, profession, city, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(
        p.id, uId, p.relation, p.gender, p.age,
        p.marital_status, p.religion, p.sect, p.education, p.profession, p.city
      );

      // 2. Family
      db.prepare(`
        INSERT OR REPLACE INTO profile_family_details (
          profile_id, father_guardian_name, mother_name,
          brothers_count, sisters_count, married_brothers_count, married_sisters_count,
          family_background
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        p.id, p.family.father, p.family.mother,
        p.family.brothers, p.family.sisters, p.family.mBrothers, p.family.mSisters,
        p.family.bg
      );

      // 3. Private
      db.prepare(`
        INSERT OR REPLACE INTO profile_private_details (
          profile_id, guardian_contact_name, contact_mobile,
          whatsapp_number, country, province, city, area,
          complete_address, other_private_notes
        ) VALUES (?, ?, ?, ?, 'Pakistan', ?, ?, ?, ?, ?)
      `).run(
        p.id, p.private.contact_name, p.private.contact_mobile,
        p.private.whatsapp, p.private.province, p.private.city, p.private.area,
        p.private.address, p.private.notes
      );

      // 4. Partner
      db.prepare(`
        INSERT OR REPLACE INTO partner_requirements (
          profile_id, preferred_gender, preferred_min_age, preferred_max_age,
          preferred_religion, preferred_sect, preferred_marital_status,
          preferred_education, preferred_profession, preferred_city,
          other_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        p.id, p.reqs.gender, p.reqs.min_age, p.reqs.max_age,
        p.reqs.religion, p.reqs.sect, p.reqs.marital,
        p.reqs.edu, p.reqs.prof, p.reqs.city,
        p.reqs.other
      );
    }
  });

  seedTx();
  console.log(`[Seed] Seeded ${sampleProfiles.length} sample profiles successfully!`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
