const db = require('../database/db');
const { generateProfileId } = require('../utils/profileId');

/**
 * Public Search for Active Rishta Profiles
 * STRICT PRIVACY: NEVER selects or returns private contact/address information!
 */
function searchProfiles(req, res) {
  try {
    const {
      gender,
      minAge,
      maxAge,
      religion,
      sect,
      marital_status,
      education,
      profession,
      city,
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["p.status = 'active'"];
    const params = [];

    if (gender && (gender === 'Male' || gender === 'Female')) {
      conditions.push('p.gender = ?');
      params.push(gender);
    }

    if (minAge) {
      const min = parseInt(minAge, 10);
      if (!isNaN(min)) {
        conditions.push('p.age >= ?');
        params.push(min);
      }
    }

    if (maxAge) {
      const max = parseInt(maxAge, 10);
      if (!isNaN(max)) {
        conditions.push('p.age <= ?');
        params.push(max);
      }
    }

    if (religion && religion.trim() !== '') {
      conditions.push('LOWER(p.religion) = LOWER(?)');
      params.push(religion.trim());
    }

    if (sect && sect.trim() !== '') {
      conditions.push('LOWER(p.sect) = LOWER(?)');
      params.push(sect.trim());
    }

    if (marital_status && marital_status.trim() !== '') {
      conditions.push('LOWER(p.marital_status) = LOWER(?)');
      params.push(marital_status.trim());
    }

    if (education && education.trim() !== '') {
      conditions.push('p.education LIKE ?');
      params.push(`%${education.trim()}%`);
    }

    if (profession && profession.trim() !== '') {
      conditions.push('p.profession LIKE ?');
      params.push(`%${profession.trim()}%`);
    }

    if (city && city.trim() !== '') {
      conditions.push('LOWER(p.city) LIKE LOWER(?)');
      params.push(`%${city.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching profiles
    const countRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM rishta_profiles p
      ${whereClause}
    `).get(...params);

    const total = countRow ? countRow.total : 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Fetch safe public fields only
    const queryParams = [...params, limitNum, offset];
    const profiles = db.prepare(`
      SELECT 
        p.profile_id,
        p.gender,
        p.age,
        p.marital_status,
        p.religion,
        p.sect,
        p.education,
        p.custom_education,
        p.profession,
        p.city,
        p.relationship_for,
        p.created_at
      FROM rishta_profiles p
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `).all(...queryParams);

    return res.json({
      success: true,
      data: {
        profiles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      }
    });
  } catch (err) {
    console.error('[Profile searchProfiles] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search profiles.' });
  }
}

/**
 * Get Public Profile Details by Profile ID
 * STRICT PRIVACY: Only public information, family background, and partner preferences.
 * NEVER returns guardian contacts, mobile numbers, or full street addresses!
 */
function getPublicProfile(req, res) {
  try {
    const { profileId } = req.params;

    const profile = db.prepare(`
      SELECT 
        p.profile_id,
        p.relationship_for,
        p.gender,
        p.age,
        p.marital_status,
        p.religion,
        p.sect,
        p.education,
        p.custom_education,
        p.profession,
        p.city,
        p.status,
        p.created_at
      FROM rishta_profiles p
      WHERE p.profile_id = ? AND p.status = 'active'
    `).get(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or currently inactive.'
      });
    }

    // Fetch public family information (omitting parent contact numbers)
    const family = db.prepare(`
      SELECT 
        brothers_count,
        sisters_count,
        married_brothers_count,
        married_sisters_count,
        family_background
      FROM profile_family_details
      WHERE profile_id = ?
    `).get(profileId) || {
      brothers_count: 0,
      sisters_count: 0,
      married_brothers_count: 0,
      married_sisters_count: 0,
      family_background: ''
    };

    // Fetch partner requirements
    const partner = db.prepare(`
      SELECT 
        preferred_gender,
        preferred_min_age,
        preferred_max_age,
        preferred_religion,
        preferred_sect,
        preferred_marital_status,
        preferred_education,
        preferred_profession,
        preferred_city,
        other_requirements
      FROM partner_requirements
      WHERE profile_id = ?
    `).get(profileId) || {};

    return res.json({
      success: true,
      data: {
        profile,
        family,
        partner_requirements: partner
      }
    });
  } catch (err) {
    console.error('[Profile getPublicProfile] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile details.' });
  }
}

/**
 * Add Rishta (Authenticated User)
 * Saves records transactionally across 4 tables:
 * - rishta_profiles
 * - profile_family_details
 * - profile_private_details (private)
 * - partner_requirements
 */
function createProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      // Step 1 & 2
      relationship_for,
      gender,
      age,
      marital_status,
      // Step 3
      religion,
      sect,
      // Step 4
      education,
      custom_education,
      profession,
      city,
      // Step 5: Family
      father_guardian_name,
      mother_name,
      brothers_count = 0,
      sisters_count = 0,
      married_brothers_count = 0,
      married_sisters_count = 0,
      family_background,
      // Step 6: Private Contact & Location
      guardian_contact_name,
      contact_mobile,
      whatsapp_number,
      country = 'Pakistan',
      province,
      area,
      complete_address,
      other_private_notes,
      // Step 7: Partner Requirements
      preferred_gender,
      preferred_min_age,
      preferred_max_age,
      preferred_religion,
      preferred_sect,
      preferred_marital_status,
      preferred_education,
      preferred_profession,
      preferred_city,
      other_requirements
    } = req.body;

    const runTransaction = db.transaction(() => {
      const profileId = generateProfileId();

      // 1. Insert into rishta_profiles
      db.prepare(`
        INSERT INTO rishta_profiles (
          profile_id, user_id, relationship_for, gender, age,
          marital_status, religion, sect, education, custom_education,
          profession, city, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `).run(
        profileId,
        userId,
        relationship_for,
        gender,
        age,
        marital_status,
        religion,
        sect || null,
        education,
        custom_education || null,
        profession,
        city
      );

      // 2. Insert into profile_family_details
      db.prepare(`
        INSERT INTO profile_family_details (
          profile_id, father_guardian_name, mother_name,
          brothers_count, sisters_count, married_brothers_count, married_sisters_count,
          family_background
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        father_guardian_name || null,
        mother_name || null,
        parseInt(brothers_count, 10) || 0,
        parseInt(sisters_count, 10) || 0,
        parseInt(married_brothers_count, 10) || 0,
        parseInt(married_sisters_count, 10) || 0,
        family_background || null
      );

      // 3. Insert into profile_private_details (STRICTLY PRIVATE)
      db.prepare(`
        INSERT INTO profile_private_details (
          profile_id, guardian_contact_name, contact_mobile,
          whatsapp_number, country, province, city, area,
          complete_address, other_private_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        guardian_contact_name,
        contact_mobile,
        whatsapp_number,
        country || 'Pakistan',
        province,
        city,
        area || null,
        complete_address,
        other_private_notes || null
      );

      // 4. Insert into partner_requirements
      db.prepare(`
        INSERT INTO partner_requirements (
          profile_id, preferred_gender, preferred_min_age, preferred_max_age,
          preferred_religion, preferred_sect, preferred_marital_status,
          preferred_education, preferred_profession, preferred_city,
          other_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        preferred_gender || null,
        preferred_min_age ? parseInt(preferred_min_age, 10) : null,
        preferred_max_age ? parseInt(preferred_max_age, 10) : null,
        preferred_religion || null,
        preferred_sect || null,
        preferred_marital_status || null,
        preferred_education || null,
        preferred_profession || null,
        preferred_city || null,
        other_requirements || null
      );

      return profileId;
    });

    const newProfileId = runTransaction();

    return res.status(201).json({
      success: true,
      message: 'Rishta profile submitted successfully.',
      profile_id: newProfileId
    });
  } catch (err) {
    console.error('[Profile createProfile] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create rishta profile. ' + err.message });
  }
}

/**
 * Get all profiles submitted by the authenticated user
 */
function getMyProfiles(req, res) {
  try {
    const userId = req.user.id;
    const profiles = db.prepare(`
      SELECT 
        profile_id,
        relationship_for,
        gender,
        age,
        religion,
        sect,
        marital_status,
        education,
        profession,
        city,
        status,
        created_at,
        updated_at
      FROM rishta_profiles
      WHERE user_id = ? AND status != 'removed'
      ORDER BY id DESC
    `).all(userId);

    return res.json({
      success: true,
      profiles
    });
  } catch (err) {
    console.error('[Profile getMyProfiles] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your profiles.' });
  }
}

/**
 * Get full profile details for the profile owner (including their own submitted private info)
 */
function getUserProfileFull(req, res) {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;

    const profile = db.prepare(`
      SELECT * FROM rishta_profiles WHERE profile_id = ? AND user_id = ?
    `).get(profileId, userId);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found or access denied.' });
    }

    const family = db.prepare('SELECT * FROM profile_family_details WHERE profile_id = ?').get(profileId) || {};
    const privateDetails = db.prepare('SELECT * FROM profile_private_details WHERE profile_id = ?').get(profileId) || {};
    const partner = db.prepare('SELECT * FROM partner_requirements WHERE profile_id = ?').get(profileId) || {};

    return res.json({
      success: true,
      data: {
        profile,
        family,
        private_details: privateDetails,
        partner_requirements: partner
      }
    });
  } catch (err) {
    console.error('[Profile getUserProfileFull] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch complete profile.' });
  }
}

/**
 * Edit Rishta Profile (by owner)
 */
function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;

    // Verify ownership
    const existing = db.prepare('SELECT id FROM rishta_profiles WHERE profile_id = ? AND user_id = ?').get(profileId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profile not found or you do not have permission to edit it.' });
    }

    const {
      relationship_for,
      gender,
      age,
      marital_status,
      religion,
      sect,
      education,
      custom_education,
      profession,
      city,
      father_guardian_name,
      mother_name,
      brothers_count,
      sisters_count,
      married_brothers_count,
      married_sisters_count,
      family_background,
      guardian_contact_name,
      contact_mobile,
      whatsapp_number,
      province,
      area,
      complete_address,
      other_private_notes,
      preferred_gender,
      preferred_min_age,
      preferred_max_age,
      preferred_religion,
      preferred_sect,
      preferred_marital_status,
      preferred_education,
      preferred_profession,
      preferred_city,
      other_requirements
    } = req.body;

    const runUpdate = db.transaction(() => {
      // 1. Update rishta_profiles
      db.prepare(`
        UPDATE rishta_profiles SET
          relationship_for = ?,
          gender = ?,
          age = ?,
          marital_status = ?,
          religion = ?,
          sect = ?,
          education = ?,
          custom_education = ?,
          profession = ?,
          city = ?,
          updated_at = datetime('now')
        WHERE profile_id = ?
      `).run(
        relationship_for,
        gender,
        parseInt(age, 10),
        marital_status,
        religion,
        sect || null,
        education,
        custom_education || null,
        profession,
        city,
        profileId
      );

      // 2. Update profile_family_details
      db.prepare(`
        UPDATE profile_family_details SET
          father_guardian_name = ?,
          mother_name = ?,
          brothers_count = ?,
          sisters_count = ?,
          married_brothers_count = ?,
          married_sisters_count = ?,
          family_background = ?
        WHERE profile_id = ?
      `).run(
        father_guardian_name || null,
        mother_name || null,
        parseInt(brothers_count, 10) || 0,
        parseInt(sisters_count, 10) || 0,
        parseInt(married_brothers_count, 10) || 0,
        parseInt(married_sisters_count, 10) || 0,
        family_background || null,
        profileId
      );

      // 3. Update profile_private_details
      db.prepare(`
        UPDATE profile_private_details SET
          guardian_contact_name = ?,
          contact_mobile = ?,
          whatsapp_number = ?,
          province = ?,
          city = ?,
          area = ?,
          complete_address = ?,
          other_private_notes = ?
        WHERE profile_id = ?
      `).run(
        guardian_contact_name,
        contact_mobile,
        whatsapp_number,
        province,
        city,
        area || null,
        complete_address,
        other_private_notes || null,
        profileId
      );

      // 4. Update partner_requirements
      db.prepare(`
        UPDATE partner_requirements SET
          preferred_gender = ?,
          preferred_min_age = ?,
          preferred_max_age = ?,
          preferred_religion = ?,
          preferred_sect = ?,
          preferred_marital_status = ?,
          preferred_education = ?,
          preferred_profession = ?,
          preferred_city = ?,
          other_requirements = ?
        WHERE profile_id = ?
      `).run(
        preferred_gender || null,
        preferred_min_age ? parseInt(preferred_min_age, 10) : null,
        preferred_max_age ? parseInt(preferred_max_age, 10) : null,
        preferred_religion || null,
        preferred_sect || null,
        preferred_marital_status || null,
        preferred_education || null,
        preferred_profession || null,
        preferred_city || null,
        other_requirements || null,
        profileId
      );
    });

    runUpdate();

    return res.json({
      success: true,
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    console.error('[Profile updateProfile] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Delete Profile (by owner)
 */
function deleteProfile(req, res) {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;

    const existing = db.prepare('SELECT id FROM rishta_profiles WHERE profile_id = ? AND user_id = ?').get(profileId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profile not found or access denied.' });
    }

    db.prepare('DELETE FROM rishta_profiles WHERE profile_id = ?').run(profileId);

    return res.json({
      success: true,
      message: 'Profile deleted successfully.'
    });
  } catch (err) {
    console.error('[Profile deleteProfile] Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete profile.' });
  }
}

module.exports = {
  searchProfiles,
  getPublicProfile,
  createProfile,
  getMyProfiles,
  getUserProfileFull,
  updateProfile,
  deleteProfile
};
