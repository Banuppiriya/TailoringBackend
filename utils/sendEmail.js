import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true if port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Tailoring App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error; // propagate error so caller can handle it
  }
};

export default sendEmail;
