const fetchingData = require('../services/accessing_DB/fetchingData');
const storingGoldPrice = require('../services/accessing_DB/storingData');
const scrapeData = require('../services/scrapping/scraper');

const AppError = require('../utils/AppError');

// email services
const storingEmailAddress = require('../mails/storingEmails');
const sendWelcomeEmail = require('../mails/welcomeMail');
const sendEmails = require('../mails/sendEmail');
const AlertPreference = require('../database/alertPreference');
const { checkAlerts } = require('../services/scheduler');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

// home route
async function homeRoute(req, res, next) {
  try {
    const data = await fetchingData();
    // Throws an error if data is null/undefined or if data has no priceArray property
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      !data[0] ||
      !data[0].priceArray
    ) {
      return res.render('home', { data: [], noData: true });
    }
    res.render('home', { data, noData: false });
  } catch (err) {
    next(err);
  }
}

// get-data
async function scrapeAndStoreGoldPrice(req, res, next) {
  try {
    const todayDoc = await scrapeData();
    await storingGoldPrice(todayDoc);
    res.redirect('/');
  } catch (err) {
    console.error('Get-data failed:', err?.message || err);
    next(err);
  }
}

// signup
async function signup(req, res, next) {
  const { email, alertMin, alertMax, alertField } = req.body;
  try {
    if (!isValidEmail(email)) {
      req.flash('error', 'Vui lòng nhập email hợp lệ');
      return res.redirect('/');
    }

    // storing the email address in the database
    await storingEmailAddress(email);
    // sends welcome Email
    await sendWelcomeEmail(email);
    const minValue = parseOptionalNumber(alertMin);
    const maxValue = parseOptionalNumber(alertMax);

    if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
      req.flash('error', 'Ngưỡng tối thiểu/tối đa phải là số');
      return res.redirect('/');
    }
    if (
      (Number.isFinite(minValue) &&
        Number.isFinite(maxValue) &&
        minValue > maxValue) ||
      (!Number.isFinite(minValue) && !Number.isFinite(maxValue))
    ) {
      req.flash(
        'error',
        'Vui lòng nhập ít nhất một ngưỡng và Min không được lớn hơn Max'
      );
      return res.redirect('/');
    }
    await AlertPreference.findOneAndUpdate(
      { email },
      {
        email,
        min: Number.isFinite(minValue) ? minValue : null,
        max: Number.isFinite(maxValue) ? maxValue : null,
        priceField:
          alertField === 'buy' || alertField === 'both' ? alertField : 'sell',
        active: true,
      },
      { upsert: true, new: true }
    );
    req.flash('success', 'Đăng ký thành công!');
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Không thể đăng ký, vui lòng thử lại');
    console.error(err.message);
    res.status(500).redirect('/');
  }
}

// send-mail
async function mailSending(req, res, next) {
  try {
    // Calling the send email module
    await sendEmails();
    // console.log('they hit the second tower');
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).redirect('/');
  }
}

// update alert settings
async function updateAlertSettings(req, res) {
  const { email, alertMin, alertMax, alertField } = req.body;
  try {
    if (!isValidEmail(email)) {
      req.flash('error', 'Vui lòng nhập email hợp lệ');
      return res.redirect('/');
    }

    const minValue = parseOptionalNumber(alertMin);
    const maxValue = parseOptionalNumber(alertMax);

    if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
      req.flash('error', 'Ngưỡng tối thiểu/tối đa phải là số');
      return res.redirect('/');
    }

    if (
      (Number.isFinite(minValue) &&
        Number.isFinite(maxValue) &&
        minValue > maxValue) ||
      (!Number.isFinite(minValue) && !Number.isFinite(maxValue))
    ) {
      req.flash(
        'error',
        'Vui lòng nhập ít nhất một ngưỡng và Min không được lớn hơn Max'
      );
      return res.redirect('/');
    }

    await storingEmailAddress(email);
    await AlertPreference.findOneAndUpdate(
      { email },
      {
        email,
        min: Number.isFinite(minValue) ? minValue : null,
        max: Number.isFinite(maxValue) ? maxValue : null,
        priceField:
          alertField === 'buy' || alertField === 'both' ? alertField : 'sell',
        active: true,
      },
      { upsert: true, new: true }
    );

    req.flash('success', 'Cập nhật ngưỡng cảnh báo thành công!');
    return res.redirect('/');
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Không thể cập nhật ngưỡng, vui lòng thử lại');
    return res.redirect('/');
  }
}

// test alert immediately
async function alertTest(req, res) {
  try {
    const result = await checkAlerts();
    if (result?.error) {
      req.flash('error', `Lỗi gửi cảnh báo: ${result.error}`);
    } else if (result?.sentCount > 0) {
      req.flash('success', `Đã gửi cảnh báo: ${result.sentCount} email`);
    } else if (result?.reason === 'cooldown') {
      req.flash('error', 'Đang trong thời gian chờ, chưa gửi lại');
    } else {
      req.flash('error', 'Không có email nào vượt ngưỡng');
    }
    return res.redirect('/');
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Không thể test cảnh báo');
    return res.redirect('/');
  }
}

// get alert settings by email
async function getAlertSettings(req, res) {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const pref = await AlertPreference.findOne({ email }).lean();
    if (!pref) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({
      email: pref.email,
      min: pref.min ?? null,
      max: pref.max ?? null,
      priceField: pref.priceField || 'sell',
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
module.exports = {
  scrapeAndStoreGoldPrice,
  homeRoute,
  signup,
  mailSending,
  updateAlertSettings,
  getAlertSettings,
  alertTest,
};
