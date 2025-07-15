import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
  // Create transporter with your SMTP service info (e.g., Gmail, Mailtrap)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,      // e.g., smtp.gmail.com
    port: process.env.EMAIL_PORT,      // e.g., 587
    secure: false,                     // true for 465, false for other ports
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

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
