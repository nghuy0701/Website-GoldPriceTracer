const cron = require('node-cron');

const scrapeData = require('./scrapping/scraper');
const storingGoldPrice = require('./accessing_DB/storingData');
const sendEmails = require('../mails/sendEmail');
const fetchGoldApiPrice = require('./scrapping/goldApi');
const sendAlertEmail = require('../mails/sendAlertEmail');
const AlertPreference = require('../database/alertPreference');

const DEFAULT_FETCH_CRON = '0 8 * * *';
const DEFAULT_EMAIL_CRON = '5 8 * * *';
const DEFAULT_ALERT_CRON = '0 * * * *';

let lastAlertAt = null;

async function checkAlerts() {
  try {
    const field = (process.env.ALERT_PRICE_FIELD || 'sell').toLowerCase();
    const cooldownMinutes = Number(process.env.ALERT_COOLDOWN_MINUTES || 60);

    if (lastAlertAt && Date.now() - lastAlertAt < cooldownMinutes * 60000) {
      return { skipped: true, reason: 'cooldown' };
    }

    const data = await fetchGoldApiPrice();
    const preferences = await AlertPreference.find({ active: true }).lean();
    if (!preferences.length) {
      return { skipped: true, reason: 'no-preferences' };
    }

    let sentCount = 0;
    for (const pref of preferences) {
      const prefField = pref.priceField || field;
      const minValue = Number.isFinite(pref.min) ? pref.min : null;
      const maxValue = Number.isFinite(pref.max) ? pref.max : null;

      if (!Number.isFinite(minValue) && !Number.isFinite(maxValue)) {
        continue;
      }

      let triggeredFields = [];
      if (prefField === 'both') {
        const buyBelow = Number.isFinite(minValue) && data.buy < minValue;
        const buyAbove = Number.isFinite(maxValue) && data.buy > maxValue;
        const sellBelow = Number.isFinite(minValue) && data.sell < minValue;
        const sellAbove = Number.isFinite(maxValue) && data.sell > maxValue;
        if (buyBelow || buyAbove) triggeredFields.push('buy');
        if (sellBelow || sellAbove) triggeredFields.push('sell');
      } else if (prefField === 'buy') {
        const buyBelow = Number.isFinite(minValue) && data.buy < minValue;
        const buyAbove = Number.isFinite(maxValue) && data.buy > maxValue;
        if (buyBelow || buyAbove) triggeredFields.push('buy');
      } else {
        const sellBelow = Number.isFinite(minValue) && data.sell < minValue;
        const sellAbove = Number.isFinite(maxValue) && data.sell > maxValue;
        if (sellBelow || sellAbove) triggeredFields.push('sell');
      }

      if (triggeredFields.length === 0) continue;

      const last = pref.lastAlertAt ? new Date(pref.lastAlertAt).getTime() : 0;
      if (last && Date.now() - last < cooldownMinutes * 60000) {
        continue;
      }

      const displayField = prefField === 'both' ? 'both' : triggeredFields[0];
      const displayPrice =
        displayField === 'buy' ? data.buy : displayField === 'sell' ? data.sell : data.sell;

      await sendAlertEmail({
        to: pref.email,
        price: displayPrice,
        field: displayField,
        min: minValue,
        max: maxValue,
        data,
        triggeredFields,
      });

      await AlertPreference.updateOne(
        { _id: pref._id },
        { $set: { lastAlertAt: new Date() } }
      );
      sentCount += 1;
    }

    if (sentCount > 0) {
      lastAlertAt = Date.now();
    }

    return { sentCount };
  } catch (err) {
    console.error('Scheduled alert failed:', err?.message || err);
    return { error: err?.message || 'error' };
  }
}

function isCronEnabled() {
  const value = process.env.CRON_ENABLED;
  if (value === undefined || value === null || value === '') {
    return true;
  }
  return String(value).toLowerCase() === 'true';
}

function startSchedulers() {
  if (!isCronEnabled()) {
    console.log('Cron disabled via CRON_ENABLED=false');
    return;
  }

  const fetchCron = process.env.CRON_TIME_FETCH || DEFAULT_FETCH_CRON;
  const emailCron = process.env.CRON_TIME_EMAIL || DEFAULT_EMAIL_CRON;
  const timezone = process.env.CRON_TIMEZONE || 'Asia/Ho_Chi_Minh';
  const alertCron = process.env.CRON_TIME_ALERT || DEFAULT_ALERT_CRON;

  cron.schedule(
    fetchCron,
    async () => {
      try {
        const todayDoc = await scrapeData();
        await storingGoldPrice(todayDoc);
        console.log('Scheduled fetch completed');
      } catch (err) {
        console.error('Scheduled fetch failed:', err?.message || err);
      }
    },
    { timezone }
  );

  cron.schedule(
    emailCron,
    async () => {
      try {
        await sendEmails();
        console.log('Scheduled email sent');
      } catch (err) {
        console.error('Scheduled email failed:', err?.message || err);
      }
    },
    { timezone }
  );

  cron.schedule(
    alertCron,
    async () => {
      await checkAlerts();
    },
    { timezone }
  );

  console.log(
    `Cron scheduled (timezone ${timezone}): fetch="${fetchCron}" email="${emailCron}" alert="${alertCron}"`
  );
}

module.exports = { startSchedulers, checkAlerts };
