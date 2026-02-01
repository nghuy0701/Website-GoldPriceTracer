// sign up mail template
function signUpEmailTemplate() {
  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    let htmlPart = `<h3>Bạn đã đăng ký thành công</h3>
      <p>Cảm ơn bạn đã đăng ký. Chúng tôi sẽ cập nhật giá vàng mới nhất mỗi ngày.</p>
      <p>Bạn sẽ nhận <strong>email hằng ngày với giá vàng hôm nay và lịch sử 10 ngày gần nhất.</strong></p>
      <p>Xem thêm thông tin tại <a href="${appUrl}">Trang theo dõi giá vàng</a> để cập nhật nhanh nhất.</p>
      `;

    return {
      From: {
        Email: process.env.SENDER_EMAIL,
        Name: 'Theo dõi giá vàng',
      },
      TextPart: 'gia vang',
      Subject: 'Đăng ký nhận giá vàng thành công',
      HTMLPart: htmlPart,
    };
  } catch (err) {
    console.error('Loi tao email chao mung:', err);
  }
}

module.exports = signUpEmailTemplate;
