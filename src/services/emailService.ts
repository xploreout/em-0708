import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_vgowhc1'; // You'll need to replace with your actual service ID
const EMAILJS_PUBLIC_KEY = 'iLCGIOkan1tn4zYOo'; // You'll need to replace with your actual public key

// Template IDs
const NEWCOMER_FORM_TEMPLATE = 'template_bf1hxk3'; // Template for newcomer form submissions
const EVENT_REGISTRATION_TEMPLATE = 'template_bf1hxk3'; // Template for event registrations
const WEBMASTER_NOTIFICATION_TEMPLATE = 'template_bf1hxk3'; // Template for webmaster notifications

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface NewcomerFormData {
  name: string;
  email: string;
  phone: string;
  availableToServe: string;
  note: string;
  purposes: {
    newcomer: boolean;
    activityInterest: boolean;
    willingToServe: boolean;
    other: boolean;
  };
  activityDetails: {
    activityName: string;
    activityDate: string;
  };
  otherPurpose: string;
}

export interface EventRegistrationData {
  name: string;
  email: string;
  phone: string;
  note: string;
  selectedEvents: Array<{
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
  }>;
}

export const sendNewcomerFormEmails = async (formData: NewcomerFormData): Promise<void> => {
  try {
    // Format purposes for email
    const selectedPurposes = Object.entries(formData.purposes)
      .filter(([_, selected]) => selected)
      .map(([purpose, _]) => {
        switch (purpose) {
          case 'newcomer': return 'I\'m a newcomer';
          case 'activityInterest': return 'Interested in specific activity';
          case 'willingToServe': return 'Willing to help and serve';
          case 'other': return 'Other reason';
          default: return purpose;
        }
      })
      .join(', ');

    // Prepare template parameters for user confirmation email
    const userEmailParams = {
      to_name: formData.name,
      to_email: formData.email,
      from_name: 'ACBCC English Ministry',
      reply_to: 'acbccem@gmail.com',
      message: `Thank you for connecting with us! We've received your information and will be in touch soon.

Your submission details:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone || 'Not provided'}
- Available to Serve: ${formData.availableToServe || 'Not specified'}
- Purpose: ${selectedPurposes}
${formData.purposes.activityInterest && formData.activityDetails.activityName ? `- Activity Interest: ${formData.activityDetails.activityName} ${formData.activityDetails.activityDate ? `(${formData.activityDetails.activityDate})` : ''}` : ''}
${formData.purposes.other && formData.otherPurpose ? `- Other Purpose: ${formData.otherPurpose}` : ''}
${formData.note ? `- Additional Notes: ${formData.note}` : ''}

We're excited to welcome you to our community!

Blessings,
ACBCC English Ministry Team`
    };

    // Prepare template parameters for webmaster notification
    const webmasterEmailParams = {
      to_name: 'ACBCC English Ministry Team',
      to_email: 'acbccem@gmail.com',
      from_name: 'Website Contact Form',
      reply_to: formData.email,
      subject: 'New Contact Form Submission',
      message: `New contact form submission received:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Available to Serve: ${formData.availableToServe || 'Not specified'}
Purpose: ${selectedPurposes}
${formData.purposes.activityInterest && formData.activityDetails.activityName ? `Activity Interest: ${formData.activityDetails.activityName} ${formData.activityDetails.activityDate ? `(${formData.activityDetails.activityDate})` : ''}` : ''}
${formData.purposes.other && formData.otherPurpose ? `Other Purpose: ${formData.otherPurpose}` : ''}
${formData.note ? `Additional Notes: ${formData.note}` : ''}

Please follow up with this person soon.`
    };

    // Send notification email to acbccem@gmail.com
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      WEBMASTER_NOTIFICATION_TEMPLATE,
      webmasterEmailParams
    );

    // Send confirmation email to user only if they provided an email
    if (formData.email) {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        NEWCOMER_FORM_TEMPLATE,
        userEmailParams
      );
    }

    console.log('Newcomer form emails sent successfully');
  } catch (error) {
    console.error('Error sending newcomer form emails:', error);
    throw new Error('Failed to send emails. Please try again.');
  }
};

export const sendEventRegistrationEmails = async (registrationData: EventRegistrationData): Promise<void> => {
  try {
    // Format selected events for email
    const eventsList = registrationData.selectedEvents
      .map(event => `- ${event.title} (${event.date} at ${event.time}, ${event.location})`)
      .join('\n');

    // Prepare template parameters for user confirmation email
    const userEmailParams = {
      to_name: registrationData.name,
      to_email: registrationData.email,
      from_name: 'ACBCC English Ministry',
      reply_to: 'acbccem@gmail.com',
      message: `Thank you for your interest in our events! We've received your registration and will send you more details soon.

Your registration details:
- Name: ${registrationData.name}
- Email: ${registrationData.email}
- Phone: ${registrationData.phone || 'Not provided'}

Events you're interested in:
${eventsList}

${registrationData.note ? `Additional Notes: ${registrationData.note}` : ''}

We're excited to see you at these events!

Blessings,
ACBCC English Ministry Team`
    };

    // Prepare template parameters for webmaster notification
    const webmasterEmailParams = {
      to_name: 'ACBCC English Ministry Team',
      to_email: 'acbccem@gmail.com',
      from_name: 'Event Registration System',
      reply_to: registrationData.email,
      subject: 'New Event Registration',
      message: `New event registration received:

Name: ${registrationData.name}
Email: ${registrationData.email}
Phone: ${registrationData.phone || 'Not provided'}

Events registered for:
${eventsList}

${registrationData.note ? `Additional Notes: ${registrationData.note}` : ''}

Please follow up with event details and logistics.`
    };

    // Send confirmation email to user
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EVENT_REGISTRATION_TEMPLATE,
      userEmailParams
    );

    // Send notification email to webmaster
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      WEBMASTER_NOTIFICATION_TEMPLATE,
      webmasterEmailParams
    );

    console.log('Event registration emails sent successfully');
  } catch (error) {
    console.error('Error sending event registration emails:', error);
    throw new Error('Failed to send emails. Please try again.');
  }
};