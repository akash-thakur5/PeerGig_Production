import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''), // Remove any spaces from the App Password
  },
});

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS is not set. Skipping email dispatch.');
    return { success: false, error: 'Missing SMTP Credentials' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"PeerGig" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('[Email Sent Successfully]', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Exception]', error);
    return { success: false, error };
  }
}
