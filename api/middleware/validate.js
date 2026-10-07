// Request validation helpers

function cleanPhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[\s\-\(\)]/g, '').trim();
}

function validateRegister(req, res, next) {
  const { mobile_number, password, confirm_password, accept_terms } = req.body;
  const errors = [];

  const cleanedPhone = cleanPhone(mobile_number);
  if (!cleanedPhone || cleanedPhone.length < 10 || cleanedPhone.length > 15) {
    errors.push('Please enter a valid mobile number (e.g. 03001234567).');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (password !== confirm_password) {
    errors.push('Password and confirm password do not match.');
  }

  if (!accept_terms) {
    errors.push('You must accept the Terms of Service and Privacy Policy to proceed.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  req.body.mobile_number = cleanedPhone;
  next();
}

function validateLogin(req, res, next) {
  const { mobile_number, password } = req.body;
  const cleanedPhone = cleanPhone(mobile_number);

  if (!cleanedPhone || !password) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and password are required.'
    });
  }

  req.body.mobile_number = cleanedPhone;
  next();
}

function validateProfile(req, res, next) {
  const {
    relationship_for,
    gender,
    age,
    marital_status,
    religion,
    education,
    profession,
    city,
    guardian_contact_name,
    contact_mobile,
    whatsapp_number,
    province,
    complete_address
  } = req.body;

  const errors = [];

  const validRelationships = ['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Other Relative'];
  if (!validRelationships.includes(relationship_for)) {
    errors.push('Please select who this proposal is for.');
  }

  if (!['Male', 'Female'].includes(gender)) {
    errors.push('Please select a valid gender (Male or Female).');
  }

  const numericAge = parseInt(age, 10);
  if (isNaN(numericAge) || numericAge < 18 || numericAge > 90) {
    errors.push('Age must be between 18 and 90 years.');
  }

  const validMaritalStatuses = ['Never Married', 'Divorced', 'Widowed'];
  if (!validMaritalStatuses.includes(marital_status)) {
    errors.push('Please select a valid marital status.');
  }

  if (!religion || religion.trim() === '') {
    errors.push('Religion is required.');
  }

  if (!education || education.trim() === '') {
    errors.push('Education is required.');
  }

  if (!profession || profession.trim() === '') {
    errors.push('Profession is required.');
  }

  if (!city || city.trim() === '') {
    errors.push('City is required.');
  }

  // Private contact validation
  if (!guardian_contact_name || guardian_contact_name.trim() === '') {
    errors.push('Guardian / Contact person name is required.');
  }

  const cleanContactMobile = cleanPhone(contact_mobile);
  if (!cleanContactMobile || cleanContactMobile.length < 10) {
    errors.push('Valid contact mobile number is required.');
  }

  const cleanWhatsapp = cleanPhone(whatsapp_number);
  if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
    errors.push('Valid WhatsApp number is required.');
  }

  if (!province || province.trim() === '') {
    errors.push('Province is required.');
  }

  if (!complete_address || complete_address.trim() === '') {
    errors.push('Complete private address is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors
    });
  }

  req.body.age = numericAge;
  req.body.contact_mobile = cleanContactMobile;
  req.body.whatsapp_number = cleanWhatsapp;
  next();
}

module.exports = {
  cleanPhone,
  validateRegister,
  validateLogin,
  validateProfile
};
