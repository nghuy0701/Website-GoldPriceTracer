
require('dotenv').config();

let express = require('express');
let router = express.Router();
const AppError = require('../utils/AppError');

const controller = require('../controller/routeCtrl');
const routeMiddleware = require('../middleware/routeSecureMiddleware');

// Middleware to set local variables for success and error flash messages
router.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
router.get('/', controller.homeRoute);

router.post('/signup', controller.signup);

router.post('/alert-settings', controller.updateAlertSettings);

router.get('/alert-settings', controller.getAlertSettings);

router.get(
  '/alert-test',
  routeMiddleware.secureRouteMiddleware,
  controller.alertTest
);

router.get(
  '/get-data',
  routeMiddleware.secureRouteMiddleware,
  controller.scrapeAndStoreGoldPrice
);

router.get(
  '/send-mail',
  routeMiddleware.secureRouteMiddleware,
  controller.mailSending
);

router.all('*', (req, res, next) => {
  next(new AppError('Page not found from here *', 404));
});

module.exports = router;
