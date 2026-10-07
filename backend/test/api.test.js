const http = require('http');
const app = require('../src/index');

function makeRequest(server, path, options = {}) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, text: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Automated Verification Tests ---');
  const server = app.listen(0); // Random free port
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest(server, '/api/health');
    assert(health.status === 200 && health.data.status === 'ONLINE', 'Health check returns ONLINE');

    // 2. Public Settings
    const settings = await makeRequest(server, '/api/settings/public');
    assert(settings.status === 200 && settings.data.data.admin_whatsapp_number, 'Public settings returns admin_whatsapp_number');
    const initialWhatsapp = settings.data.data.admin_whatsapp_number;

    // 3. User Register
    const randomMobile = '0331' + Math.floor(1000000 + Math.random() * 9000000);
    const regRes = await makeRequest(server, '/api/auth/register', {
      method: 'POST',
      body: {
        mobile_number: randomMobile,
        password: 'Password@123',
        confirm_password: 'Password@123',
        accept_terms: true
      }
    });
    assert(regRes.status === 201 && regRes.data.token, `User registered (${randomMobile})`);
    const userToken = regRes.data.token;

    // 4. User Login
    const loginRes = await makeRequest(server, '/api/auth/login', {
      method: 'POST',
      body: {
        mobile_number: randomMobile,
        password: 'Password@123'
      }
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'User logged in successfully');

    // 5. Search Public Profiles
    const searchRes = await makeRequest(server, '/api/profiles/search?gender=Female&city=Sahiwal');
    assert(searchRes.status === 200 && Array.isArray(searchRes.data.data.profiles), 'Search returns profiles array');
    const femaleProfiles = searchRes.data.data.profiles;
    assert(femaleProfiles.length > 0, 'Found matching profile for Female in Sahiwal');

    // PRIVACY CHECK 1: Ensure search never leaks private fields
    const leakedSearchField = femaleProfiles.some(p => p.contact_mobile || p.whatsapp_number || p.complete_address || p.guardian_contact_name);
    assert(!leakedSearchField, 'SECURITY: Search profiles NEVER contains contact_mobile, whatsapp_number, or complete_address');

    // 6. Public Profile Detail
    const detailRes = await makeRequest(server, '/api/profiles/JRC-10001/public');
    assert(detailRes.status === 200 && detailRes.data.data.profile.profile_id === 'JRC-10001', 'Public detail returns JRC-10001');

    // PRIVACY CHECK 2: Ensure detail view never leaks private details
    const pData = detailRes.data.data;
    assert(!pData.profile.contact_mobile && !pData.profile.complete_address && !pData.private_details, 
      'SECURITY: Public profile detail STRICTLY omits private contact and address');

    // 7. Add Rishta
    const addRes = await makeRequest(server, '/api/profiles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        relationship_for: 'My Brother',
        gender: 'Male',
        age: 27,
        marital_status: 'Never Married',
        religion: 'Muslim',
        sect: 'Sunni',
        education: 'Master',
        profession: 'Financial Analyst',
        city: 'Rawalpindi',
        father_guardian_name: 'M. Rafiq',
        mother_name: 'Shabana',
        brothers_count: 2,
        sisters_count: 1,
        married_brothers_count: 1,
        married_sisters_count: 0,
        family_background: 'Settled in Rawalpindi.',
        guardian_contact_name: 'M. Rafiq',
        contact_mobile: '03007654321',
        whatsapp_number: '03007654321',
        province: 'Punjab',
        area: 'Satellite Town',
        complete_address: 'House 12, Commercial Market, Satellite Town, Rawalpindi',
        preferred_gender: 'Female',
        preferred_min_age: 21,
        preferred_max_age: 26,
        preferred_religion: 'Muslim',
        preferred_sect: 'Sunni',
        preferred_marital_status: 'Never Married',
        preferred_education: 'Bachelor',
        preferred_city: 'Rawalpindi, Islamabad',
        other_requirements: 'Simple and educated family.'
      }
    });
    assert(addRes.status === 201 && addRes.data.profile_id.startsWith('JRC-'), `Add Rishta created profile ${addRes.data.profile_id}`);
    const newProfileId = addRes.data.profile_id;

    // 8. My Profiles
    const myProf = await makeRequest(server, '/api/profiles/user/my-profiles', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(myProf.status === 200 && myProf.data.profiles.some(p => p.profile_id === newProfileId), 'My Profiles lists newly created profile');

    // 9. Admin Login
    const adminLogin = await makeRequest(server, '/api/admin/login', {
      method: 'POST',
      body: {
        username: 'superadmin',
        password: 'Admin@JeemRishta2026'
      }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin logged in successfully');
    const adminToken = adminLogin.data.token;

    // 10. Admin Dashboard
    const dash = await makeRequest(server, '/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dash.status === 200 && dash.data.stats.totalProfiles >= 10, 'Admin Dashboard shows real stats');

    // 11. Admin View Full Profile (INCLUDING PRIVATE DETAILS)
    const adminProfile = await makeRequest(server, `/api/admin/profiles/${newProfileId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminProfile.status === 200 && adminProfile.data.data.private_details.contact_mobile === '03007654321', 
      'Admin CAN view private contact details for verification');

    // 12. Admin Block Profile
    const blockRes = await makeRequest(server, `/api/admin/profiles/${newProfileId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'blocked' }
    });
    assert(blockRes.status === 200 && blockRes.data.success, `Admin blocked profile ${newProfileId}`);

    // 13. Verify blocked profile is NOT returned in public search or public detail
    const publicBlocked = await makeRequest(server, `/api/profiles/${newProfileId}/public`);
    assert(publicBlocked.status === 404, 'Blocked profile immediately hidden from public API');

    // 14. Admin Settings update
    const updatedNumber = '923119876543';
    const setRes = await makeRequest(server, '/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { settings: { admin_whatsapp_number: updatedNumber } }
    });
    assert(setRes.status === 200, 'Admin successfully updated WhatsApp number');

    const newPublicSettings = await makeRequest(server, '/api/settings/public');
    assert(newPublicSettings.data.data.admin_whatsapp_number === updatedNumber, 'Public settings reflects updated WhatsApp number dynamically');

    // 15. Audit Logs check
    const auditRes = await makeRequest(server, '/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(auditRes.status === 200 && auditRes.data.data.logs.length > 0, 'Audit logs recorded admin actions');

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
