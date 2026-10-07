const db = require('../database/db');

/**
 * Generates the next sequential Profile ID in the format JRC-10001, JRC-10002, etc.
 */
function generateProfileId() {
  const row = db.prepare(`
    SELECT profile_id FROM rishta_profiles 
    WHERE profile_id LIKE 'JRC-%' 
    ORDER BY id DESC LIMIT 1
  `).get();

  if (!row || !row.profile_id) {
    return 'JRC-10001';
  }

  const parts = row.profile_id.split('-');
  const lastNum = parseInt(parts[1], 10);
  if (isNaN(lastNum)) {
    return 'JRC-10001';
  }

  const nextNum = lastNum + 1;
  return `JRC-${nextNum}`;
}

module.exports = {
  generateProfileId
};
