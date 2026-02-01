function buildAlertEmail({ price, field, min, max, data, triggeredFields }) {
  const priceLabel =
    field === 'buy' ? 'Giá mua' : field === 'sell' ? 'Giá bán' : 'Giá mua & bán';
  const subject = `Cảnh Báo giá vàng vượt ngưỡng: ${priceLabel} ${price.toLocaleString('vi-VN')} VND`;
  const sourceLabel = `${data.type || 'SJC'} - ${data.city || 'TP.HCM'}`;
  const minLabel =
    min !== null && min !== undefined
      ? Number(min).toLocaleString('vi-VN')
      : 'Không đặt';
  const maxLabel =
    max !== null && max !== undefined
      ? Number(max).toLocaleString('vi-VN')
      : 'Không đặt';

  const htmlPart = `
  <div style="font-family: Arial, sans-serif; color:#222; line-height:1.6;">
    <h2 style="margin:0 0 8px 0;">Cảnh báo giá vàng</h2>
    <p style="margin:0 0 16px 0;">Giá đã vượt ngưỡng bạn đặt.</p>
    ${
      triggeredFields && triggeredFields.length
        ? `<p style="margin:0 0 16px 0;"><strong>Vượt ngưỡng:</strong> ${triggeredFields
            .map((item) => (item === 'buy' ? 'Giá mua' : 'Giá bán'))
            .join(', ')}</p>`
        : ''
    }

    <div style="border:1px solid #333; padding:12px; border-radius:6px; margin-bottom:16px;">
      <div style="font-size:14px; color:#555;">${sourceLabel}</div>
      <div style="font-size:18px; font-weight:bold; margin-top:6px;">
        ${priceLabel}: ${price.toLocaleString('vi-VN')} VND
      </div>
    </div>

    <h4 style="margin:0 0 8px 0;">Giá hiện tại</h4>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-bottom:16px;">
      <thead>
        <tr>
          <th style="border:1px solid #333;padding:6px;text-align:center;">Mua vào</th>
          <th style="border:1px solid #333;padding:6px;text-align:center;">Bán ra</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #333;padding:6px;text-align:center;">${data.buy.toLocaleString('vi-VN')}</td>
          <td style="border:1px solid #333;padding:6px;text-align:center;">${data.sell.toLocaleString('vi-VN')}</td>
        </tr>
      </tbody>
    </table>

    <h4 style="margin:0 0 8px 0;">Ngưỡng cảnh báo của bạn</h4>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <thead>
        <tr>
          <th style="border:1px solid #333;padding:6px;text-align:center;">Min</th>
          <th style="border:1px solid #333;padding:6px;text-align:center;">Max</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #333;padding:6px;text-align:center;">${minLabel}</td>
          <td style="border:1px solid #333;padding:6px;text-align:center;">${maxLabel}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `;

  return { subject, htmlPart };
}

module.exports = buildAlertEmail;
