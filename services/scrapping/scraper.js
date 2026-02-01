const { config } = require('dotenv');
config();
const axios = require('axios');
const AppError = require('../../utils/AppError');

const DEFAULT_API_URL = 'https://www.vang.today/api/prices';
const DEFAULT_TYPE_CODE = 'DOHCML';

function formatPrice(value) {
  const numberValue =
    typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numberValue)) {
    return '';
  }
  return Math.round(numberValue).toLocaleString('vi-VN');
}

function formatDateFromUnixSeconds(value) {
  const fallback = new Date().toLocaleDateString('vi-VN');
  if (!value) {
    return fallback;
  }
  const timestamp = value > 1e12 ? value : value * 1000;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toLocaleDateString('vi-VN');
}

// Fetch gold prices from giavang.now / vang.today API
async function scrapeData() {
  try {
    const baseUrl = process.env.GOLD_API_URL || DEFAULT_API_URL;
    const typeCode = process.env.GOLD_TYPE_CODE || DEFAULT_TYPE_CODE;
    const url = `${baseUrl}?type=${encodeURIComponent(typeCode)}`;

    const response = await axios.get(url, { timeout: 10000 });
    const payload = response?.data;
    if (!payload || payload.success !== true) {
      throw new AppError('Invalid gold price response');
    }

    const latest = Array.isArray(payload.data) ? payload.data[0] : payload;
    if (!latest || latest.buy == null || latest.sell == null) {
      throw new AppError('No gold price data returned');
    }

    const date = latest.date
      ? latest.date
      : formatDateFromUnixSeconds(
          latest.update_time || payload.current_time || payload.timestamp
        );
    const buy = formatPrice(latest.buy);
    const sell = formatPrice(latest.sell);

    const todayDoc = [date, buy, sell];
    if (!todayDoc[1] || !todayDoc[2]) {
      throw new AppError('No valid gold price data returned');
    }

    return todayDoc;
  } catch (error) {
    throw new AppError(`An error occurred: ${error.message}`);
  }
}

module.exports = scrapeData;
