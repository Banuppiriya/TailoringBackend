import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailTemplates = {
  initial_payment: {
    subject: 'Initial Payment Received - Order #{orderNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for your payment!</h2>
        <p>We've received your initial payment for order #{orderNumber}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Payment Details:</h3>
          <p style="margin: 5px 0;">Service: {serviceName}</p>
          <p style="margin: 5px 0;">Amount Paid: ${amount}</p>
          <p style="margin: 5px 0;">Remaining Balance: ${remainingAmount}</p>
        </div>
        <p>We'll start processing your order right away. You'll be notified when your order is complete and ready for final payment.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `
  },
  final_payment: {
    subject: 'Final Payment Received - Order #{orderNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Completed!</h2>
        <p>We've received your final payment for order #{orderNumber}.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Payment Details:</h3>
          <p style="margin: 5px 0;">Service: {serviceName}</p>
          <p style="margin: 5px 0;">Amount Paid: ${amount}</p>
          <p style="margin: 5px 0;">Status: Fully Paid</p>
        </div>
        <p>Thank you for your business! Your order is now complete.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      </div>
    `
  },
  payment_failed: {
    subject: 'Payment Failed - Order #{orderNumber}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>Unfortunately, your payment for order #{orderNumber} was not successful.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Payment Details:</h3>
          <p style="margin: 5px 0;">Amount: ${amount}</p>
        </div>
        <p>Please try again or contact us if you need assistance.</p>
        <a href="{paymentLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Try Payment Again</a>
      </div>
    `
  }
};

export const sendPaymentEmail = async ({ to, type, data }) => {
  try {
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Email template "${type}" not found`);
    }

    let subject = template.subject;
    let html = template.html;

    // Replace all placeholders like {key} with data[key]
    Object.entries(data).forEach(([key, value]) => {
      const pattern = new RegExp(`{${key}}`, 'g');
      subject = subject.replace(pattern, value);
      html = html.replace(pattern, value);
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });

    console.log(`Payment ${type} email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
