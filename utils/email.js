const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user,url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Erhan ERTEM <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    //->#1 Create a transporter for 'production'
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid OR SendinBlue
      return nodemailer.createTransport({
        service: 'SendinBlue', // either provide service name or host, port info
        // host: process.env.SENDINBLUE_HOST,
        // port: process.env.SENDINBLUE_PORT,
        auth: {
          user: process.env.SENDINBLUE_USERNAME,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }

    //->#2 Create a transporter for 'developement'
    return nodemailer.createTransport({
      // service: 'Gmail',
      //Activate in gmail "less secure app" option to establish a link
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Send the actual email
  async send(emailTemplate, subject) {
    //#1.Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${emailTemplate}.pug`,
      { firstName: this.firstName, url: this.url, subject }
    );
    //#2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject, // subject: subject, ES6
      html, // html: html, ES6
      text: htmlToText.convert(html, {
        wordwrap: 80,
      }),
    };
    //#3.Create a trnasport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

// const sendEmail = async options => {
// //->#1 Create a transporter
// const transporter = nodemailer.createTransport({
//   // service: 'Gmail',
//   //Activate in gmail "less secure app" option to establish a link
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
// //->#2 Define the email options
// const mailOptions = {
//   from: 'Erhan ERTEM <hello@erhan.io>',
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
//   // html: options.html,
// };
//   //->#3 Send the email with nodeemailer - async process
//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendEmail;
