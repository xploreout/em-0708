# ACBCC English Ministry Website

A modern, responsive website for the ACBCC English Ministry community built with React, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Beautiful, mobile-first design that works on all devices
- **Event Management**: Display upcoming events and past memories with photo galleries
- **Contact Forms**: Newcomer form and event registration with email notifications
- **Resource Library**: Bible studies, devotional materials, and video archive
- **Email Integration**: Automated email notifications using EmailJS

## Email Setup (EmailJS)

This website uses EmailJS to send automated emails when forms are submitted. To set up email functionality:

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Create a new service (Gmail, Outlook, etc.)
3. Note your Service ID

### 2. Create Email Templates
Create the following templates in your EmailJS dashboard:

#### Template 1: Newcomer Form Confirmation (template_newcomer)
```
Subject: Welcome to ACBCC English Ministry!

Hi {{to_name}},

{{message}}
```

#### Template 2: Event Registration Confirmation (template_event_reg)
```
Subject: Event Registration Confirmation

Hi {{to_name}},

{{message}}
```

#### Template 3: Webmaster Notification (template_webmaster)
```
Subject: {{subject}}

{{message}}
```

### 3. Update Configuration
In `src/services/emailService.ts`, update the following constants:

```typescript
const EMAILJS_SERVICE_ID = 'your_service_id'; // Replace with your EmailJS service ID
const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Replace with your EmailJS public key
- ~/projects/acbcc/em-first/emfirst-0708
```

### 4. Template IDs
Make sure your template IDs match:
- `template_newcomer` - For newcomer form confirmations
- `template_event_reg` - For event registration confirmations  
- `template_webmaster` - For webmaster notifications

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Email Flow

### Newcomer Form Submission
1. User fills out the newcomer form
2. Form validation and reCAPTCHA verification
3. Two emails are sent:
   - Confirmation email to the user
   - Notification email to acbccem@gmail.com

### Event Registration
1. User registers for events through the modal
2. Form validation and reCAPTCHA verification  
3. Two emails are sent:
   - Confirmation email to the user with event details
   - Notification email to acbccem@gmail.com with registration info

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **EmailJS** - Email service
- **Lucide React** - Icons
- **React Google reCAPTCHA** - Spam protection

## Deployment

The site is configured for deployment on Netlify. The build command is `npm run build` and the publish directory is `dist`.

## Contact

For questions about this website, contact acbccem@gmail.com