# Gold Price Tracker


Dự án giúp đơn giản hóa việc theo dõi **giá vàng hằng ngày** và gửi mail **cảnh báo nếu giá vàng vượt ngưỡng** mà mình đặt ra, tự động cập nhật và **gửi email mỗi ngày** với thông tin giá vàng mới nhất.



## Roadmap


- Thêm cơ chế bộ nhớ đệm (cache)


## Tech Stack


**Server:**

- Node.js
- Express
- Mongoose
- MongoDB Atlas

**Email**
- Gmail SMTP (App Password)

**Front-end**
- HTML, CSS
- Bootstrap
- EJS


## Note


Dự án hiện tập trung cập nhật giá vàng tại **TP.HCM** và sử dụng API miễn phí từ **giavang.now / vang.today** (không cần API key)

**Biến môi trường (tuỳ chọn)**

- `GOLD_API_URL` (mặc định: `https://www.vang.today/api/prices`)
- `GOLD_TYPE_CODE` (mặc định: `DOHCML` – DOJI HCM)


## Run Locally

Clone dự án

```bash
 git clone 
```

Link github GoldPriceTracker

```
https://github.com/nghuy0701/Website-GoldPriceTracer.git
```

Cài đặt dependencies

```bash
  npm install
```

Khởi động server

```bash
  npm run start
```

Truy cập ứng dụng

```bash
 http://localhost:3000
```

Test gửi mail báo giá (hằng ngày)

```
$pair = "GoldTracker:GoldInTPHCM!"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
Invoke-WebRequest http://localhost:3000/send-mail -Headers @{ Authorization = "basic $basic" } -UseBasicParsing
```

Test gửi mail cảnh báo vượt ngưỡng

```
$pair = "GoldTracker:GoldInTPHCM!"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
Invoke-WebRequest http://localhost:3000/alert-test -Headers @{ Authorization = "basic $basic" } -UseBasicParsing
```
