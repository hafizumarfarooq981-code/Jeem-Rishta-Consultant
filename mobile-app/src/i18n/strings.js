/**
 * Centralized Localization Dictionary
 * Compliant with Specification Clause 2:
 * "Do not hard-code text throughout the application. All UI text should be stored
 * in a centralized/localized structure so Urdu or other languages can be added
 * later without rewriting the application."
 */

export const strings = {
  en: {
    // App Header & Branding
    appName: 'Jeem Rishta Consultant',
    appTagline: 'Free & Dignified Matrimonial Matchmaking',
    versionBadge: 'Version 1.0',

    // Navigation
    navHome: 'Home',
    navSearch: 'Search',
    navAdd: 'Add Rishta',
    navMyProfiles: 'My Profiles',
    navSettings: 'Settings',

    // Auth
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in with your registered mobile number',
    registerTitle: 'Create an Account',
    registerSubtitle: 'Register free to search or submit matrimonial proposals',
    mobileNumber: 'Mobile Number',
    mobilePlaceholder: 'e.g. 03001234567',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    agreeTerms: 'I accept the Terms of Service & Privacy Policy',
    signInBtn: 'Sign In',
    signUpBtn: 'Create Free Account',
    noAccountPrompt: "Don't have an account?",
    alreadyAccountPrompt: 'Already have an account?',
    logout: 'Log Out',

    // Home Screen
    heroTitle: 'Find Suitable Proposals with Complete Privacy',
    heroDescription: 'A free platform for finding and connecting suitable matrimonial proposals through an Admin-managed contact system.',
    safeNoticeTitle: 'Safe & Admin-Managed Contact',
    safeNoticeDesc: 'To protect family privacy and prevent harassment, direct user-to-user messaging is not permitted. Contact Admin via WhatsApp to initiate respectful communication between verified families.',
    quickSearchBtn: 'Search Rishtas',
    quickAddBtn: 'Add Rishta Proposal',
    quickMyProfilesBtn: 'View My Profiles',
    recentProfilesHeader: 'Recently Added Proposals',
    noDirectContactBadge: '100% Free & Privacy Protected',

    // Search Screen
    searchTitle: 'Search Matrimonial Profiles',
    filterGender: 'Looking For',
    filterAll: 'All',
    filterMale: 'Groom (Male)',
    filterFemale: 'Bride (Female)',
    filterAgeRange: 'Age Range',
    filterMinAge: 'Min Age',
    filterMaxAge: 'Max Age',
    filterReligion: 'Religion',
    filterSect: 'Sect',
    filterMaritalStatus: 'Marital Status',
    filterEducation: 'Education',
    filterProfession: 'Profession',
    filterCity: 'City',
    filterApplyBtn: 'Apply Filters',
    filterClearBtn: 'Clear Filters',
    searchResultsCount: 'Matching Proposals',
    noProfilesFound: 'No profiles match your current search filters. Try clearing or expanding your criteria.',

    // Profile Detail
    profileDetailTitle: 'Candidate Dossier',
    viewDetails: 'View Details',
    contactAdminBtn: 'Contact Admin on WhatsApp',
    contactNotice: 'Pressing this button will open WhatsApp with the Admin along with the pre-filled Profile ID for immediate assistance.',
    matrimonialInfo: 'Candidate Information',
    familyInfo: 'Family Background',
    partnerReqs: 'Desired Partner Preferences',
    brothers: 'Brothers',
    marriedBrothers: 'Married Brothers',
    sisters: 'Sisters',
    marriedSisters: 'Married Sisters',

    // Add Rishta Wizard
    wizardTitle: 'Submit Rishta Proposal',
    step1Title: 'Proposal Relationship',
    step1Desc: 'Who is this matrimonial proposal for?',
    step2Title: 'Basic Information',
    step2Desc: 'Gender, numeric age, and marital status',
    step3Title: 'Religion & Sect',
    step3Desc: 'Faith and denominational affiliation',
    step4Title: 'Education & Profession',
    step4Desc: 'Academic qualifications and current occupation',
    step5Title: 'Family Information',
    step5Desc: 'Parents, siblings, and family background',
    step6Title: 'Private Information',
    step6Desc: 'Confidential guardian contact & physical address',
    step7Title: 'Partner Requirements',
    step7Desc: 'Desired qualities and criteria for suitable match',
    step8Title: 'Review & Submit',
    step8Desc: 'Confirm profile details before publishing',

    nextStep: 'Continue',
    prevStep: 'Back',
    submitProfile: 'Submit Matrimonial Profile',

    // My Profiles
    myProfilesTitle: 'My Submitted Proposals',
    myProfilesEmpty: 'You have not submitted any rishta proposals yet. Tap below to create your first proposal.',
    addNewRishtaBtn: 'Add New Rishta',
    statusActive: 'Active (Visible)',
    statusBlocked: 'Blocked by Admin',
    statusRemoved: 'Removed',
    editProfile: 'Edit Profile',
    deleteProfile: 'Delete Proposal',
    deleteConfirm: 'Are you sure you want to delete this matrimonial profile? This cannot be undone.',

    // Settings
    settingsTitle: 'Account & Privacy Settings',
    accountInfo: 'Account Information',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    updatePasswordBtn: 'Update Password',
    legalSection: 'Legal & Privacy Guidelines',
    termsTitle: 'Terms & Conditions',
    privacyTitle: 'Privacy Policy',
    dangerZone: 'Permanent Account Removal',
    deleteAccountBtn: 'Delete Account Permanently',
    deleteAccountWarn: 'Deleting your account is permanent. All your submitted matrimonial profiles and personal records will be immediately erased.',
    confirmDeleteAccountBtn: 'Permanently Delete Account & Data',

    // Privacy & Security Badges
    strictlyPrivateBadge: 'STRICTLY PRIVATE: Visible only to authorized Admin, never shown in public search.',
    freeServiceNotice: 'Jeem Rishta Consultant is 100% free with zero fees or commissions.'
  }
};

let currentLanguage = 'en';

export function t(key) {
  return strings[currentLanguage]?.[key] || strings.en[key] || key;
}

export function setLanguage(lang) {
  if (strings[lang]) {
    currentLanguage = lang;
  }
}

export function getLanguage() {
  return currentLanguage;
}
