const signUpEmailTemplate = require('./signUpTemplate');
const createTransport = require('./smtpTransport');

const transport = createTransport();

async function sendWelcomeEmail(email) {
  try {
    if (!email) {
      return console.error('error address in not provided');
    }

    const config = signUpEmailTemplate();
    await transport.sendMail({
      from: `${config.From.Name} <${config.From.Email}>`,
      to: email,
      subject: config.Subject,
      html: config.HTMLPart,
    });
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = sendWelcomeEmail;
