export const API_ENDPOINTS = {

    //for Auth
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh',
    RESEND_OTP: "/auth/resendOtp",
    ADD_Email_ACCOUNTS_OUTLOOK: '/auth/outlook/connect',
    ADD_Email_ACCOUNTS_GMAIL: '/auth/google',

    //for users
    SIGN_UP: '/users',
    USER_PROFILE: '/users/profile',
    GET_ALL_USERS: '/users/allUsers',
    UPDATE_PROFILE: '/users/updateProfile',
    UPDATE_PASSWORD: '/users/changePassword',
    RESET_PASSWORD: '/users/reset-password',
    FORGOT_PASSWORD: '/users/forgot-password',
    VERIFY_TWO_FACTOR_AUTH: "/users/verify-2fa",
    Verify_EMAIL: "/users/verify-email",

    // user configuration

    CUSTOM_EMAIL_REPLY_PROMPT: '/CustomMailReplyPrompt',

    // for emails

    ALL_EMAILS: '/emails/allEmail',
    SEND_EMAILS: '/emails/send',
    REPLY_EMAILS: '/emails/replyToEmail/',
    CREATE_DRAFT_EMAILS: '/emails/createReplyDraft/',
    REPLY_DRAFT_EMAILS: '/emails/sendDraft/',
    Email_ACCOUNTS: '/user-configurations/email-accounts',
    UPDATE_EMAIL: '/emails/update',
    DISSCONNECT_EMAIL_ACCOUNT: '/user-configurations/updateUserConfiguration',
    REMOVE_EMAIL_ACCOUNT: '/user-configurations/updateUserConfiguration',
    GENERATE_NEW_RESPONSE: '/emails/generate-new-response',
    REFERESH_EMAILS: '/sync/refreshNewEmail',

    //for customer
    ALL_CUSTOMER: '/customer/getAllCustomer',
    ADD_CUSTOMER: '/customer',

    //for organizations
    INVITE_USER: '/organizations/inviteUser',
    VERIFY_INVITES: '/organizations/verify-invites',
    GET_ALL_ORGANIZATIONS: "/organizations",

    // for Files
    GET_ALL_FILES: '/file/getAllFilelist',
    GET_ALL_AI_VECTOR_MESSAGES: '/file/getAllAiVectorMessages',
    VIEW_FILE: '/file/generate-signed-url',
    UPLOAD_FILES: '/file/uploadFiles',
    GET_FILE_VECTOR_RESP: '/file/getFileVectorResponse',

    //tags 
    ADD_TAG: '/tags/update-tags',
    GET_TAGS: '/tags/get-tags',

    // account Summary
    ADD_ACCOUNT_SUMMARY: '/account-summary',
    GET_ALL_ACCOUNT_SUMMARY: '/account-summary/getAllAccountSummary',
};
