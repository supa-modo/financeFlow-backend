import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

/**
 * Create a nodemailer transporter
 * In development, we use Ethereal (fake SMTP service)
 * In production, you would configure this with your actual email service
 */
const createTransporter = async () => {
  // For production, use your actual email service configuration
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // For development/testing, use Ethereal (fake SMTP service)
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  return transporter;
};

/**
 * Send an email
 * @param options - Email options (recipient, subject, message)
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = await createTransporter();
    
    // Define email options
    const mailOptions = {
      from: `FinanceFlow <${process.env.EMAIL_FROM || 'noreply@financeflow.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, '<br>'),
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log email preview URL (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email. Please try again later.');
  }
};

/**
 * Send a password reset email
 * @param email - Recipient email
 * @param resetToken - Password reset token
 * @param resetUrl - URL for password reset
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> => {
  const subject = 'FinanceFlow - Password Reset (valid for 10 minutes)';
  
  // Create HTML version of the email with better styling
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4F46E5;">FinanceFlow</h1>
      </div>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Your Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
        
        <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">This password reset link is only valid for 10 minutes.</p>
      </div>
      
      <div style="text-align: center; color: #6B7280; font-size: 12px;">
        <p>If you have any questions, please contact our support team.</p>
        <p>&copy; ${new Date().getFullYear()} FinanceFlow. All rights reserved.</p>
      </div>
    </div>
  `;
  
  // Plain text version as fallback
  const message = `
    Forgot your password?
    
    We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
    
    To reset your password, please click the link below (valid for 10 minutes):
    ${resetUrl}
    
    If you have any questions, please contact our support team.
    
    FinanceFlow Team
  `;
  
  await sendEmail({
    email,
    subject,
    message,
    html,
  });
};
