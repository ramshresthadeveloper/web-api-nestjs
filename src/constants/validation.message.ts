const validationMessages = {
  EN: {
    MUST_BE_MONGO_ID: '$property must be a valid mongoId.',
    PROPERTY_REQUIRED: '$property is required.',

    //   EXECUTIVE_MEMBER
    NAME_REQUIRED: 'Team member name is required.',
    ROLE_REQUIRED: 'Role is required.',
    DP_REQUIRED: 'Photo is required.',

    // ADMIN
    EMAIL_REQUIRED: 'Email is required.',
    PROVIDE_VALID_EMAIL: 'Provide valid email.',
    PASSWORD_REQUIRED: 'Password is required.',
  },
};
const lang = process.env.SYSTEM_LANGUAGE || 'EN';

let MSG;

if (lang == 'EN') {
  MSG = validationMessages.EN;
}

export default MSG;
