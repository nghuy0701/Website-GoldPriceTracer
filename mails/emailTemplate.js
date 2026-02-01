const fetchingData = require('../services/accessing_DB/fetchingData');

function formatChange(symbol, value) {
  const numeric = Number.isFinite(value) ? value : parseInt(value, 10) || 0;
  if (!numeric) {
    return '0';
  }
  if (symbol === '+') {
    return `+${numeric}`;
  }
  if (symbol === '-') {
    return `-${numeric}`;
  }
  return `${numeric}`;
}

async function getEmailConfig() {
  try {
    const data = await fetchingData();
    const latestData = data[data.length - 1];
    if (!latestData) {
      throw new Error('No gold price data available');
    }

    let trendRows = '';
    for (let i = data.length - 1; i >= 0; i--) {
      trendRows += `<tr>
      <td style="border:1px solid #333;padding:6px;text-align:center;">${data[i].priceArray[0]}</td>
      <td style="border:1px solid #333;padding:6px;text-align:center;">${data[i].priceArray[1]}</td>
      <td style="border:1px solid #333;padding:6px;text-align:center;">${data[i].priceArray[2]}</td>
      </tr>`;
    }

    return {
      From: {
        Email: process.env.SENDER_EMAIL,
        Name: 'Theo dõi giá vàng',
      },
      Subject: 'Giá vàng hôm nay tại TP.HCM',
      HTMLPart: `
        <h3>Giá vàng TP.HCM hôm nay</h3>
        <p>Mua vào: <strong>VND ${latestData.priceArray[1]}</strong> (${formatChange(
          latestData.statusData.symbol,
          latestData.statusData.change[0]
        )})</p>
        <p>Bán ra: <strong>VND ${latestData.priceArray[2]}</strong> (${formatChange(
          latestData.statusData.symbol,
          latestData.statusData.change[1]
        )})</p>
        <h4>Giá vàng TP.HCM trong 10 ngày gần nhất</h4>
        <table style="border-collapse: collapse; width: 100%; max-width: 800px;">
          <thead>
            <tr>
              <th style="border:1px solid #333;padding:6px;text-align:center;">Ngày</th>
              <th style="border:1px solid #333;padding:6px;text-align:center;">Mua (VND/lượng)</th>
              <th style="border:1px solid #333;padding:6px;text-align:center;">Bán (VND/lượng)</th>
            </tr>
          </thead>
          <tbody>
            ${trendRows}
          </tbody>
        </table>
      `,
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
  }
}

module.exports = getEmailConfig;
