require('dotenv').config();
const buildAlertEmail = require('./priceAlertTemplate');
const createTransport = require('./smtpTransport');

const transport = createTransport();

async function sendAlertEmail({ to, price, field, min, max, data, triggeredFields }) {
  const { subject, htmlPart } = buildAlertEmail({
    price,
    field,
    min,
    max,
    data,
    triggeredFields,
  });

  const recipients = Array.isArray(to) ? to : [to];
  for (const email of recipients) {
    await transport.sendMail({
      from: `Theo dõi giá vàng <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject,
      html: htmlPart,
    });
  }
}

module.exports = sendAlertEmail;
