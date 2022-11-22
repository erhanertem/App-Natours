const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //->#1 Create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    //Activate in gmail "less secure app" option to establish a link
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //->#2 Define the email options
  const mailOptions = {
    from: 'Erhan ERTEM <hello@erhan.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };
  //->#3 Send the email with nodeemailer - async process
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;