const dbEnum = {
  rating: ['like', 'dislike'],
  notificationType: [
    'announcement-milestone-reached',
    'event-milestone-reached',
    'event-created',
    'event-deleted',
    'enquiry-received',
    'enquiry-assigned',
    'announcement-created',
    'enquiry-responded',
    'media-created',
  ],
  transactionType: ['activate', 'renew', 'upgrade', 'cancel', 'downgrade'],
  subscriptionPlanType: ['premium', 'basic', 'free'],
  registeredFrom: ['normal', 'facebook', 'google', 'apple'],
  companyType: ['interested', 'invested'],
};

const ENUM = dbEnum;
enum MonthlyPromptStatus {
  draft = 'draft',
  published = 'published',
}

enum SendEmailOtpType {
  login = 'login',
  register = 'register',
}

enum TeamMemberRole {
  admin = 'admin',
  viewer = 'viewer',
}
export { ENUM, MonthlyPromptStatus, SendEmailOtpType, TeamMemberRole };
