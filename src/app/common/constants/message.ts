import { MessageType } from "../../models/message.model";

// ✅ Reset password
export const RESET_PASSWORD_SUCCESS: MessageType = { message: 'Please check your email to reset your password.', status: 'success', icon: '✔' };
export const RESET_PASSWORD_FAILED: MessageType = { message: 'Failed to reset password. Please try again.', status: 'error', icon: '✖' };

// ✅ OTP
export const OTP_SENT_SUCCESS: MessageType = { message: 'One-time password sent. Please check your email.', status: 'success', icon: '✔' };
export const OTP_SENT_FAILED: MessageType = { message: 'Failed to send OTP. Please try again.', status: 'error', icon: '✖' };

export const TWO_FA_NOT_REQUIRED_OR_INVALID: MessageType = { message: '2FA not required or response is invalid.', status: 'error', icon: '✖' };

export const OTP_RESENT_SUCCESS: MessageType = { message: 'A new OTP has been sent to your email.', status: 'success', icon: '✔' };
export const OTP_RESEND_FAILED: MessageType = { message: 'Failed to resend OTP. Please try again.', status: 'error', icon: '✖' };

export const OTP_OR_TOKEN_MISSING: MessageType = { message: 'OTP or temporary token is missing.', status: 'error', icon: '✖' };
export const OTP_VERIFIED_SUCCESS: MessageType = { message: 'OTP verified. Logging in...', status: 'success', icon: '✔' };
export const OTP_VERIFICATION_FAILED: MessageType = { message: 'OTP verification failed. Please try again.', status: 'error', icon: '✖' };

// ✅ Login
export const LOGIN_SUCCESS: MessageType = { message: 'Login successful!', status: 'success', icon: '✔' };
export const LOGIN_FAILED: MessageType = { message: 'Login failed. Please try again.', status: 'error', icon: '✖' };
export const LOGIN_PROFILE_LOAD_FAILED: MessageType = { message: 'Login succeeded, but failed to load profile.', status: 'warning', icon: '' };

// ✅ Email
export const EMAIL_SENT_SUCCESS: MessageType = { message: 'Email sent successfully.', status: 'success', icon: '✔' };
export const EMAIL_SEND_FAILED: MessageType = { message: 'Failed to send email. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_FIELDS_REQUIRED: MessageType = { message: 'Please fill in subject, body, and at least one recipient.', status: 'error', icon: '✖' };

// ✅ Email update
export const EMAIL_ARCHIVE_SUCCESS: MessageType = { message: 'Email status updated successfully.', status: 'success', icon: '✔' };
export const EMAIL_ARCHIVE_FAILED: MessageType = { message: 'Failed to update email status. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_ARCHIVE_FIELDS_REQUIRED: MessageType = { message: 'Invalid status update request.', status: 'error', icon: '✖' };

// ✅ Email disconnect
export const EMAIL_DISCONNECT_SUCCESS: MessageType = { message: 'Email account disconnected successfully.', status: 'success', icon: '✔' };
export const EMAIL_DISCONNECT_FAILED: MessageType = { message: 'Failed to disconnect email account. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_DISCONNECT_FIELDS_REQUIRED: MessageType = { message: 'Invalid account disconnect request.', status: 'error', icon: '✖' };

// ✅ Email Account Remove 
export const EMAIL_REMOVE_SUCCESS: MessageType = { message: 'Email account removed successfully.', status: 'success', icon: '✔' };
export const EMAIL_REMOVE_FAILED: MessageType = { message: 'Failed to removed email account. Please try again.', status: 'error', icon: '✖' };

// ✅ Save To Draft
export const EMAIL_DRAFT_SUCCESS: MessageType = { message: 'Email draft saved successfully.', status: 'success', icon: '✔' };
export const EMAIL_DRAFT_FAILED: MessageType = { message: 'Failed to save email draft. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_DRAFT_REQUIRED: MessageType = { message: 'Please fill in subject, body, and at least one recipient.', status: 'error', icon: '✖' };

// ✅ Account creation
export const ACCOUNT_CREATED_SUCCESS: MessageType = { message: 'Your account has been created successfully. Please verify your email.', status: 'success', icon: '✔' };
export const ACCOUNT_CREATED_FAILED: MessageType = { message: 'Failed to create account. Please try again.', status: 'error', icon: '✖' };

// ✅ Password
export const PASSWORD_UPDATE_SUCCESS: MessageType = { message: 'Password updated successfully.', status: 'success', icon: '✔' };
export const PASSWORD_UPDATE_ERROR: MessageType = { message: 'Failed to update password. Please try again.', status: 'error', icon: '✖' };

// ✅ Profile
export const PROFILE_UPDATE_SUCCESS: MessageType = { message: 'Profile updated successfully.', status: 'success', icon: '✔' };
export const PROFILE_UPDATE_ERROR: MessageType = { message: 'Failed to update profile. Please try again.', status: 'error', icon: '✖' };

// ✅ Misc
export const TEMP_TOKEN_NOT_FOUND: MessageType = { message: 'Temporary token not found.', status: 'error', icon: '✖' };
export const GENERIC_ERROR: MessageType = { message: 'Something went wrong. Please try again.', status: 'error', icon: '✖' };

// ✅ Email account confirmation
export const CONFIRM_ADD_EMAIL_ACCOUNT: MessageType = { message: 'Are you sure you want to add this email account?', status: 'success', icon: '' };

// ✅ Email verification
export const EMAIL_VERIFY_SUCCESS = { message: 'Success! Your email has been verified.', status: 'success', icon: '✔' };
export const EMAIL_VERIFY_FAILED = { message: 'Email verification failed. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_TOKEN_MISSING = { message: 'Verification token is missing.', status: 'error', icon: '✖' };

// ✅ user Inviattion
export const USER_INVITATION_SUCCESS = { message: 'Success! Your user Invitation has been verified.', status: 'success', icon: '✔' };
export const USER_INVITATION_FAILED = { message: ' user Invitation verification failed. Please try again.', status: 'error', icon: '✖' };

// ✅ ADD customer
export const ADD_CUSTOMER_SUCCESS: MessageType = { message: 'New customer added successfully.', status: 'success', icon: '✔' };
export const ADD_CUSTOMER_FAILED: MessageType = { message: 'Failed to add customer. Please try again.', status: 'error', icon: '✖' };
export const ADD_CUSTOMER_FIELDS_REQUIRED: MessageType = { message: 'Invalid customer add request.', status: 'error', icon: '✖' };

// update customer
export const UPDATE_CUSTOMER_SUCCESS: MessageType = { message: 'Customer updated successfully.', status: 'success', icon: '✔' };
export const UPDATE_CUSTOMER_FAILED: MessageType = { message: 'Failed to update customer. Please try again.', status: 'error', icon: '✖' };
export const UPDATE_CUSTOMER_FIELDS_REQUIRED: MessageType = { message: 'Invalid customer update request.', status: 'error', icon: '✖' };

// delete customer

export const DELETE_CUSTOMER_SUCCESS: MessageType = { message: 'Customer deleted successfully.', status: 'success', icon: '✔' };
export const DELETE_CUSTOMER_FAILED: MessageType = { message: 'Failed to delete customer. Please try again.', status: 'error', icon: '✖' };
export const DELETE_CUSTOMER_FIELDS_REQUIRED: MessageType = { message: 'Invalid customer delete request.', status: 'error', icon: '✖' };

export const EMAIL_REFRESH_SUCCESS: MessageType = { message: 'Email refresh successfully.', status: 'success', icon: '✔' };
export const EMAIL_REFRESH_FAILED: MessageType = { message: 'Failed to refresh email. Please try again.', status: 'error', icon: '✖' };

export const EMAIL_UPDATE_SUCCESS: MessageType = { message: 'Email updated successfully.', status: 'success', icon: '✔' };
export const EMAIL_UPDATE_FAILED: MessageType = { message: 'Failed to update email. Please try again.', status: 'error', icon: '✖' };

export const EMAIL_UPDATE_TAGS_SUCCESS: MessageType = { message: 'Email tags updated successfully.', status: 'success', icon: '✔' };
export const EMAIL_UPDATE_TAGS_FAILED: MessageType = { message: 'Failed to update email tags. Please try again.', status: 'error', icon: '✖' };

export const EMAIL_REPLY_PROMPT_SUCCESS: MessageType = { message: 'Email reply prompt added successfully.', status: 'success', icon: '✔' };
export const EMAIL_REPLY_PROMPT_FAILED: MessageType = { message: 'Failed to add email  reply prompt. Please try again.', status: 'error', icon: '✖' };
export const EMAIL_FETCH_PROMPT_FAILED: MessageType = { message: 'Failed to fetch email prompt. Please try again.', status: 'error', icon: '✖' };

export const ACCOUNT_OVERVIEW_SUCCESS: MessageType = { message: 'Account summary generated successfully.', status: 'success', icon: '✔' };
export const ACCOUNT_OVERVIEW_FAILED: MessageType = { message: 'Failed to generated summary. Please try again.', status: 'error', icon: '✖' };

// ✅ user Inviattion success
export const SEND_INVITATION_SUCCESS = { message: 'Invitation has been sent successfully.', status: 'success', icon: '✔' };
export const SEND_INVITATION_FAILED = { message: 'Invitation sent failed. Please try again.', status: 'error', icon: '✖' };

// ✅ file upload succesfully success
export const FILE_UPLOAD_SUCCESS = { message: 'File(s) uploaded successfully.', status: 'success', icon: '✔' };

export const FILE_UPLOAD_FAILED = { message: 'File upload failed. Please try again.', status: 'error', icon: '✖' };
