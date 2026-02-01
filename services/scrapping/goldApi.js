const axios = require('axios');

function formatPrice(value) {
  if (typeof value === 'number') return value;
  const numeric = String(value || '').replace(/[^\d.-]/g, '');
  return numeric ? Number(numeric) : null;
}

async function fetchGoldApiPrice() {
  const baseUrl = process.env.GOLD_API_URL || 'https://www.vang.today/api/prices';
  const typeCode = process.env.GOLD_TYPE_CODE || 'DOHCML';
  const timeoutMs = Number(process.env.GOLD_API_TIMEOUT_MS || 20000);
  const url = `${baseUrl}?type=${encodeURIComponent(typeCode)}`;

  const response = await axios.get(url, { timeout: timeoutMs });
  const payload = response?.data;
  if (!payload || payload.success !== true) {
    throw new Error('Invalid gold API response');
  }

  const latest = Array.isArray(payload.data) ? payload.data[0] : payload;
  if (!latest || latest.buy == null || latest.sell == null) {
    throw new Error('No gold price data returned');
  }

  const buy = formatPrice(latest.buy);
  const sell = formatPrice(latest.sell);
  if (!Number.isFinite(buy) || !Number.isFinite(sell)) {
    throw new Error('Invalid buy/sell values');
  }

  return {
    sourceUrl: url,
    city: latest.name || 'TP.HCM',
    type: latest.type || typeCode,
    buy,
    sell,
  };
}

module.exports = fetchGoldApiPrice;
