// Function to store emails (contacts) in the database.
const AppError = require('../utils/AppError');
const AlertPreference = require('../database/alertPreference');
async function storingEmailAddress(email) {
  try {
    if (!email) {
      throw new AppError('Email address not provided');
    }
    await AlertPreference.findOneAndUpdate(
      { email },
      { email, active: true },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(err?.message || err);
    throw err;
  }
}

module.exports = storingEmailAddress;
