# Email Configuration Guide for CTRG Grant System

This guide explains how to configure email notifications for the CTRG Grant Review Management System. The system sends automated emails for reviewer assignments, revision requests, deadline reminders, and final decisions.

## Table of Contents

1. [Overview](#overview)
2. [Option 1: Gmail SMTP (Recommended for Development)](#option-1-gmail-smtp-recommended-for-development)
3. [Option 2: SendGrid (Recommended for Production)](#option-2-sendgrid-recommended-for-production)
4. [Option 3: Console Backend (Testing Only)](#option-3-console-backend-testing-only)
5. [Testing Email Configuration](#testing-email-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Email Templates](#email-templates)

---

## Overview

The CTRG system sends the following types of emails:

- **Reviewer Assignment Notifications**: Sent when a reviewer is assigned to a proposal
- **Revision Request Notifications**: Sent to PIs when revisions are requested
- **Final Decision Notifications**: Sent to PIs with final grant decisions
- **Deadline Reminders**: Automated reminders for upcoming deadlines
  - Revision deadline reminder (24 hours before)
  - Review deadline reminder (48 hours before)

All email configuration is managed through environment variables in the `.env` file.

---

## Option 1: Gmail SMTP (Recommended for Development)

Gmail SMTP is the easiest option for local development and small-scale deployments.

### Prerequisites

- A Gmail account
- 2-Factor Authentication (2FA) enabled on your Gmail account

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2FA if not already enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other (Custom name)" and enter "CTRG Grant System"
4. Click **Generate**
5. Google will display a 16-character app password (e.g., `abcd efgh ijkl mnop`)
6. **Copy this password** - you won't be able to see it again

### Step 3: Update .env File

Open `backend/.env` and update the email settings:

```env
# Email Configuration (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop  # Your 16-character app password (no spaces)
DEFAULT_FROM_EMAIL=CTRG Grant System <your-email@gmail.com>
```

**Important Notes:**
- Remove spaces from the app password when pasting into .env
- Use your full Gmail address for `EMAIL_HOST_USER`
- The `DEFAULT_FROM_EMAIL` is what recipients will see as the sender

### Step 4: Verify Configuration

Restart the Django server after updating `.env`:

```bash
# Stop the server (Ctrl+C)
# Restart it
python manage.py runserver
```

---

## Option 2: SendGrid (Recommended for Production)

SendGrid is a reliable email service provider suitable for production deployments with higher email volumes.

### Step 1: Create SendGrid Account

1. Sign up at: https://signup.sendgrid.com/
2. Free tier includes 100 emails/day
3. Complete email verification and sender authentication

### Step 2: Create API Key

1. Log in to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it "CTRG Grant System"
5. Select **Full Access** permissions
6. Click **Create & View**
7. **Copy the API key** - it will only be shown once

### Step 3: Verify Sender Email

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details (use a real email you can access)
4. Check your email and click the verification link

### Step 4: Update .env File

```env
# Email Configuration (SendGrid)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey  # Literally the word "apikey"
EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your SendGrid API key
DEFAULT_FROM_EMAIL=CTRG Grant System <noreply@yourdomain.com>
```

**Important Notes:**
- `EMAIL_HOST_USER` must be literally `apikey` (not your email)
- Use the API key as the password
- Use the verified sender email for `DEFAULT_FROM_EMAIL`

### Step 5: Verify Configuration

Restart the Django server and test email sending.

---

## Option 3: Console Backend (Testing Only)

For development and testing without sending real emails, use the console backend. Emails will print to the terminal instead of being sent.

### Update .env File

```env
# Email Configuration (Console - for testing)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=CTRG Grant System <noreply@nsu.edu>
```

When emails are "sent", they will appear in the terminal where Django is running.

**Use Cases:**
- Initial development and testing
- Demo environments where real emails aren't needed
- Debugging email content

---

## Testing Email Configuration

After configuring email, test that emails are being sent correctly.

### Method 1: Django Shell

1. Open Django shell:
   ```bash
   python manage.py shell
   ```

2. Send a test email:
   ```python
   from django.core.mail import send_mail

   send_mail(
       subject='CTRG Test Email',
       message='This is a test email from the CTRG Grant System.',
       from_email=None,  # Uses DEFAULT_FROM_EMAIL
       recipient_list=['test-recipient@example.com'],  # Your email
       fail_silently=False,
   )
   ```

3. Check for errors:
   - **Success**: Returns `1` (number of emails sent)
   - **Failure**: Raises an exception with error details

4. Exit shell:
   ```python
   exit()
   ```

### Method 2: Through the Application

1. Create a test reviewer assignment in the admin panel
2. Send notification via the application
3. Check the recipient's inbox

### Common Test Email Addresses

- Your own email for initial testing
- [Mailtrap.io](https://mailtrap.io/) for safe testing (catches emails without sending)
- [Mailinator.com](https://mailinator.com/) for disposable inboxes

---

## Troubleshooting

### Gmail: "Username and Password not accepted"

**Cause:** Using regular Gmail password instead of app password

**Solution:**
- Ensure 2FA is enabled on your Gmail account
- Generate a new app password from https://myaccount.google.com/apppasswords
- Use the 16-character app password (remove spaces)

### Gmail: "SMTPAuthenticationError: (534, b'5.7.9 Application-specific password required')"

**Cause:** 2FA not enabled or trying to use regular password

**Solution:**
- Enable 2-Factor Authentication
- Generate and use an app-specific password

### SendGrid: "550 The from address does not match a verified Sender Identity"

**Cause:** Sender email not verified in SendGrid

**Solution:**
- Go to SendGrid → Settings → Sender Authentication
- Verify the sender email address you're using
- Update `DEFAULT_FROM_EMAIL` to match verified sender

### Emails Not Being Received

**Check:**
1. Spam/Junk folder - automated emails often end up here
2. Email service logs (SendGrid has delivery logs)
3. Django logs for email errors:
   ```bash
   tail -f backend/logs/django.log
   ```

### Connection Timeout Errors

**Cause:** Firewall blocking outbound SMTP connections (port 587 or 465)

**Solution:**
- Try port 465 with SSL instead of TLS:
  ```env
  EMAIL_PORT=465
  EMAIL_USE_SSL=True
  EMAIL_USE_TLS=False
  ```
- Check network/firewall settings
- Try from a different network

### SSL Certificate Errors

**Solution:**
Update .env to skip SSL verification (not recommended for production):
```env
# Add this if you encounter SSL certificate issues
EMAIL_SSL_CERTFILE=
EMAIL_SSL_KEYFILE=
```

---

## Email Templates

The system uses the following email templates (located in `backend/proposals/services.py`):

### 1. Reviewer Assignment Email

```
Subject: CTRG Proposal Review Assignment - {proposal_code}

Dear {reviewer_name},

You have been assigned to review the following proposal:

Proposal: {proposal_title}
Code: {proposal_code}
PI: {pi_name}
Review Stage: Stage {stage}
Deadline: {deadline}

Please log in to the CTRG Grant Review System to access the proposal and submit your review.

Best regards,
CTRG Grant Review System
```

### 2. Revision Request Email

```
Subject: CTRG Proposal Revision Requested - {proposal_code}

Dear {pi_name},

Your proposal has been reviewed and revisions are requested:

Proposal: {proposal_title}
Decision: Tentatively Accepted (Revisions Required)
Revision Deadline: {deadline}

Please review the feedback and submit your revised proposal.

Best regards,
CTRG Grant Review System
```

### 3. Final Decision Email

```
Subject: CTRG Proposal Final Decision - {proposal_code}

Dear {pi_name},

The final decision for your proposal has been made:

Proposal: {proposal_title}
Decision: {decision}
{Approved Amount: $amount (if accepted)}

Thank you for your submission.

Best regards,
CTRG Grant Review System
```

---

## Production Recommendations

For production deployments:

1. **Use SendGrid or similar service** (not Gmail)
   - Better deliverability
   - Higher sending limits
   - Better analytics and monitoring

2. **Set up SPF, DKIM, and DMARC records**
   - Improves email deliverability
   - Prevents emails from being marked as spam
   - SendGrid provides guidance on this

3. **Use a custom domain**
   - `noreply@yourdomain.com` instead of Gmail
   - More professional appearance
   - Better email reputation

4. **Monitor email delivery**
   - Check SendGrid analytics regularly
   - Set up alerts for bounces and failures
   - Keep email content professional to avoid spam filters

5. **Implement email queue**
   - Use Celery for async email sending
   - Already configured in the system
   - Prevents blocking the web server

6. **Test thoroughly**
   - Test all email types before going live
   - Verify emails aren't going to spam
   - Check formatting on different email clients

---

## Support

If you continue to experience issues:

1. Check Django logs: `backend/logs/django.log`
2. Enable email debug output in settings
3. Verify network connectivity to SMTP server
4. Contact your email service provider's support

For Gmail: https://support.google.com/mail/

For SendGrid: https://support.sendgrid.com/

---

## Security Best Practices

- **Never commit `.env` file** to version control
- **Use environment variables** for all credentials
- **Rotate app passwords** periodically
- **Limit API key permissions** to only what's needed
- **Monitor email usage** for suspicious activity
- **Use TLS/SSL** for all SMTP connections

---

Last Updated: February 2026
