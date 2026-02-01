// Calculates price changes based on yesterday and today's buy/sell prices
function parsePrice(value) {
  if (typeof value === 'number') {
    return value;
  }
  const numeric = String(value || '').replace(/[^\d]/g, '');
  return numeric ? parseInt(numeric, 10) : 0;
}

function getPriceDifferenceInfo(yesterdayDoc, todayDoc) {
  const todayBuy = parsePrice(todayDoc[1]);
  const todaySell = parsePrice(todayDoc[2]);

  const yesterdayBuy = parsePrice(yesterdayDoc.priceArray[1]);
  const yesterdaySell = parsePrice(yesterdayDoc.priceArray[2]);

  const differenceBuy = todayBuy - yesterdayBuy;
  const differenceSell = todaySell - yesterdaySell;

  if (differenceBuy > 0 && differenceSell > 0) {
    return {
      change: [differenceBuy, differenceSell],
      symbol: '+',
    };
  }
  if (differenceBuy < 0 && differenceSell < 0) {
    return {
      change: [Math.abs(differenceBuy), Math.abs(differenceSell)],
      symbol: '-',
    };
  }
  return {
    change: [Math.abs(differenceBuy), Math.abs(differenceSell)],
    symbol: '',
  };
}

module.exports = getPriceDifferenceInfo;
