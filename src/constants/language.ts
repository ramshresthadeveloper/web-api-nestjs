const responseMessages = {
  EN: {
    // Announcement
    ANNOUNCEMENT_NOT_FOUND: 'Announcement not found.',
    ANNOUNCEMENT_FROM_ASX_UNEDITABLE:
      'Only annoucement created within diolog are editable.',
    ANNOUNCEMENT_FROM_ASX_UNDELETEABLE:
      'Only annoucement created within diolog can be deleted.',
    NO_ACCESS: 'You do not have permission to access.',
    // Admin
    ADMIN_UPADATE_SUCCESS: 'Admin updated successfully.',
    ADMIN_CREATED_EMAIL_SENT:
      'Admin created successfully. Password has been sent to your email.',

    // Company
    BUSINESS_NAME_TAKEN: 'Business name already taken.',
    BUSINESS_REGISTERED: 'Business already registered.',
    COMPANY_NOT_FOUND: 'Business with given id not found',
    ASX_CODE_TAKEN: 'ASX code is already taken.',
    DELETE_COMPANY_FORBIDDEN: 'User cannot remove company.',
    COMPANY_NOT_VALIDATED: 'Company not validated',
    INVALID_ASXCODE: 'Invalid ASX Code.',

    // Company Event
    EVENT_NOT_FOUND: 'Event not found.',
    EVENT_END_DATE_ERROR: 'End date must be greater than start date.',
    START_END_TIME_REQUIRED:
      'Please provide start time and end time if event is not all day.',
    INVALID_START_END_TIME: 'Please make sure start time is before end time.',
    NO_CREATE_EVENT_PERMISSION: 'User does not have create event permission.',
    NO_DELETE_EVENT_PERMISSION: 'User does not have delete event permission.',
    NO_UPDATE_EVENT_PERMISSION: 'User does not have update event permission.',

    // Email OTP
    INVALID_OTP: 'Invalid or expired OTP',
    OTP_ALREADY_SENT: 'OTP already sent.',
    OTP_REQUIRED: 'OTP is required.',
    OTP_SENT_SUCCESS: 'OTP email sent successfully',
    OTP_TYPE_MUST_BE_LOGIN_OR_REGISTER: 'Otp type must be login or register',
    USER_VERIFIED_ALREADY: 'User email has been already verified',
    FINGERPRINT_REQUIRED: 'Fingerprint irs required',
    FIREBASE_TOKEN_REQUIRED: 'FirebaseToken is required',
    BROWSER_NOT_VERIFIED: 'Broswer is not verified.Please login and verify',

    // EMAIL_TEMPLATE
    EMAIL_TEMPLATE_ALREADY_EXISTS: 'Email template already exists.',
    EMAIL_TEMPLATE_NOT_FOUND: 'Email template not found.',

    // Enquiry
    ENQUIRY_NOT_FOUND: 'Enquiry not found.',
    ENQUIRIES_NOT_FOUND: 'Enquiries not found.',
    ENQUIRY_RESOLVED_SUCCESSFULLY: 'Enquiry resolved successfully.',
    ENQUIRIES_RESOLVED_SUCCESSFULLY: 'Enquiries resolved successfully.',
    ENQUIRIES_ARCHIVED_SUCCESSFULLY: 'Enquiries archived successfully.',
    ENQUIRIES_UNARCHIVED_SUCCESSFULLY: 'Enquiries unarchived successfully.',
    STAFF_NOT_IN_TEAM: 'Staff id not found in team.',
    ENQUIRES_ASSIGNED_SUCCESSFULLY: 'Enquiries assigned successfully',
    ENQUIRY_ASSIGNED_SUCCESSFULLY: 'Enquiry assigned successfully',
    ENQUIRY_RESPONDED: 'Enquiry already responded.',
    NO_ENQUIRY_MGMT_PERMISSION:
      'User does not have question management permission.',

    // Enquiry Category
    ENQUIRY_CATEGORY_NOT_FOUND: 'Enquiry category not found.',
    ENQUIRY_CATEGORY_ASSIGNED: 'Enquiry category assigned successfully.',

    //EXECUTIVE_TEAM_MEMBER
    EXECUTIVE_MEMBER_DELETED: 'Executive team member is deleted successfully.',
    NO_ADMINISTRATIVE_PERMISSION:
      'User does not have administrative permission.',
    NO_READ_PERMISSION: 'User does not have read permission.',
    EXECUTIVE_MEMBER_NOT_FOUND: 'Executive member not found.',

    // Faq
    FAQ_CREATED: 'Faq created successfully.',
    FAQ_NOT_FOUND: 'Faq not found.',
    FAQ_DELETED: 'Faq deleted successfully.',
    FAQ_SAME_ORDER_POSTION: 'No new position to order',
    FAQ_ORDERED: 'Faqs ordered successfully.',

    // Faq Category
    FAQ_CATEGORY_CREATED: 'Faq category added successfully.',
    FAQ_CATEGORY_NOT_FOUND: 'Faq category not found.',
    FAQ_CATEGORY_DELETED: 'Faq category deleted successfully.',
    FAQ_CATEGORY_SAME_ORDER_POSTION: 'No new position to order',
    FAQ_CATEGORY_ORDERED: 'Faq categories ordered successfully.',

    //GOOGLE
    INVALID_ID_TOKEN: 'Provided google id_token is invalid',

    // Notification
    NOTIFICATION_NOT_FOUND: 'Notification not found.',
    NOTIFICATION_READ_SUCCESSFULLY: 'Notification read successfully.',

    // PAGE
    PAGE_ALREADY_EXISTS: 'Page already exists.',
    PAGE_DELETED: 'Page deleted successfully.',
    PAGE_NOT_FOUND: 'Page you requested does not exist. ',
    CANNOT_DELETE_PAGE: 'Page could not be deleted.',

    // Password
    INVALID_OLD_PASSWORD: 'Invalid old password.',
    NEW_PASSWORD_SAME_WITH_OLD_PASSWORD:
      'Your new password is too similar to your current password. Please try another password.',
    PASSWORD_CHANGE_SUCCESS: 'Password has been successfully changed.',
    OLD_PASSWORD_REQUIRED: 'Old password is required.',
    NEW_PASSWORD_REQUIRED: 'New password is required.',
    INVALID_OLD_PASSWORD_FORMAT:
      'Old password must be minimum 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special characters.',
    INVALID_NEW_PASSWORD_FORMAT:
      'New password must be minimum 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special characters.',

    // Registration
    NEED_ACCEPTED_TC: 'Please accept terms and condition in order to register.',
    EMAIL_TAKEN: 'Email is already taken.',
    MOBILE_NUM_TAKEN: 'Mobile number already exists.',

    // Response Template
    RESPONSE_TEMPLATE_NOT_FOUND: 'Response template not found.',
    RESPONSE_TEMPLATE_PERMANENT_DELETE_MESSAGE:
      'Response template permanently deleted',

    // Token
    INVALID_EXPIRED_TOKEN: 'Invalid or expired link',
    MUST_BE_VALID_JWT_TOKEN: '$property must be valid JWT token.',

    // Team Member
    NOT_AUTHORIZED_TO_ADD_MEMEBERS:
      'You donot have sufficient permission to add team members',
    NOT_AUTHORIZED_TO_UPDATE_MEMEBERS:
      'You donot have sufficient permission to update team members',
    NOT_AUTHORIZED_TO_DELETE_MEMEBERS:
      'You donot have sufficient permission to delete team members',
    NO_INVITATION_EMAIL_TEMPLATE: 'No template found for invitation mail.',
    TEAM_MEMBER_DETAIL_UPDATE_SUCCESS:
      'Team member detail updated successfully',
    TEAM_MEMBER_DELETE_SUCCESS: 'Team member deleted successfully',
    TEAM_MEMBER_PERMISSIONS_UPDATE_SUCCESS:
      'Team member permissions updated successfully',
    CANNOT_ENTER_OWN_EMAIL: 'You cannot enter your own email.',
    MUST_BE_VIEWER_OR_ADMIN: 'Role must be viewer or admin',
    ROLE_REQUIRED: 'Role is required.',

    // User
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    FORGOT_PASSWORD_EMAIL_SEND: 'Forgot password email send successfully',
    USER_DOESNOT_EXIST: 'User doesnt exist.',
    EXPIRED_: 'Invalid Token.',
    EMAIL_NOT_FOUND: 'Email does not exist.',
    USER_HAS_REGISTERED_BUSINESS: 'User has already registered a business.',
    LOGOUT_SUCCESS: 'User logged out successfully.',

    // ****** Default values ********

    //pagingation
    DEFAULT_LIMIT: 10,
    DEFAULT_PAGE: 1,

    // ****** Input Validation messages ******

    // MongoId validation
    INVALID_MONGOID: '$property is invalid',

    // User Validation
    FIRST_NAME_REQUIRED: 'First name is required.',
    LAST_NAME_REQUIRED: 'Last name is required.',
    INVALID_EMAIL: 'Please provide valid email address.',
    EMAIL_REQUIRED: 'Email is required.',
    INVALID_PASSWORD_FORMAT:
      'Password must be minimum 8 characters with 1 uppercase, 1 lowercase, 1 number and 1 special characters.',
    PASSWORD_REQUIRED: 'Password is required.',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long.',

    MOBILE_MAX_LENGTH: 'Mobile number must not be longer than 20 characters.',
    MOBILE_MIN_LENGTH: 'Mobile number must be at least 10 characters long.',
    PROVIDE_VALID_MOBILE: 'Please provide valid mobile number.',

    JOB_TITLE_REQUIRED: 'Job title is required.',

    // Activity Description
    ACTIVITY_ANNOUNCEMENT_CREATED: 'Created an announcement.',
    ACTIVITY_ANNOUNCEMENT_PUBLISHED: 'Published an announcement',
    ACTIVITY_ANNOUNCEMENT_DELETED: 'Deleted an announcement.',
    ACTIVITY_EVENT_CREATED: 'Created an event.',
    ACTIVITY_EVENT_DELETED: 'Deleted an event.',
    ACTIVITY_ENQUIRY_RESOLVED: 'Marked question as resolved.',
    ACTIVITY_ENQUIRY_ARCHIVED: 'Marked question as archived.',
    ACTIVITY_ENQUIRY_UNARCHIVED: 'Marked question as unarchived.',
    ACTIVITY_ENQUIRY_ASSIGNED: 'Assigned question to team.',
    ACTIVITY_COMPANY_DETAIL_UPDATED: 'Company detail updated.',
    ACTIVITY_FEEDBACK_CREATED: 'Submitted a feedback.',

    // subscription
    ACTIVATE: 'activate',
    PREMIUM: 'premium',
    BASIC: 'basic',
    FREE: 'free',
    UPGRADE: 'upgrade',
    DOWNGRADE: 'downgrade',
    RENEW: 'renew',
    CANCEL: 'cancel',
    ACTIVE: 'active',
    TRIAL_DAYS: 30,

    //Onboarding Checklist
    INVITE_INVESTOR_CHECKLIST_ALREADY_COMPLETED:"Invite investor checklist is already completed"
  },
};

const lang = process.env.SYSTEM_LANGUAGE || 'EN';
let Lang;

if (lang == 'EN') {
  Lang = responseMessages.EN;
}

export default Lang;
