require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
  ,
  retention: {
    auditDays: parseInt(process.env.RETENTION_AUDIT_DAYS || '90', 10),
    attemptsDays: parseInt(process.env.RETENTION_ATTEMPTS_DAYS || '30', 10),
    blockedDays: parseInt(process.env.RETENTION_BLOCKED_DAYS || '30', 10),
    securityAlertsDays: parseInt(process.env.RETENTION_SECURITY_ALERTS_DAYS || '90', 10),
    tempDays: parseInt(process.env.RETENTION_TEMP_DAYS || '7', 10)
  },
  scheduler: {
    enabled: process.env.SCHEDULER_ENABLED !== 'false'
  }
};
