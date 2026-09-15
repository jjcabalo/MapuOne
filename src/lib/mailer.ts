import nodemailer from 'nodemailer';

// Configure the transporter with your Gmail SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // Use 465 for secure, 587 for TLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g., mapuone.app@gmail.com
    pass: process.env.SMTP_PASS, // e.g., iwlx qxul doax nexa
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Utility function to send an email via Gmail SMTP
 */
export const sendEmail = async ({ to, subject, html }: SendMailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"MapúOne Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
