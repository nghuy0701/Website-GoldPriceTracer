const AlertPreference = require('../database/alertPreference');

// Function to retrieve contact information (email addresses) from DB.
async function fetchingMailAddresses() {
  try {
    const contacts = await AlertPreference.find({ active: true })
      .select('email')
      .lean();
    return contacts.map((contact) => contact.email);
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = fetchingMailAddresses;
