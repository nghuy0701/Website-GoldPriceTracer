require('dotenv').config();
const getEmailConfig = require('./emailTemplate');
const fetchingMailAddresses = require('./fetchingMails');
const createTransport = require('./smtpTransport');

const transport = createTransport();

// Function to fetch data (gold prices) and send emails using SMTP.
async function sendingMails() {
  try {
    const emails = await fetchingMailAddresses();
    if (!emails || emails.length === 0) {
      return console.error('No emails found');
    }
    const config = await getEmailConfig();
    for (const email of emails) {
      await transport.sendMail({
        from: `${config.From.Name} <${config.From.Email}>`,
        to: email,
        subject: config.Subject,
        html: config.HTMLPart,
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = sendingMails;
