var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
const sequelize = require("./sql");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ProductRouter = require("./routes/products");
var CategoryRouter = require("./routes/categories");
var AuthRouter = require("./routes/auth");
var orderRouter = require("./routes/order"); 
var wishlistRouter = require('./routes/wishlist');
var paymentRouter = require("./routes/payments");
var notificationRouter = require("./routes/notifications");
var supportRouter = require("./routes/support");
var adminRouter = require("./routes/admin");

var app = express();  

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({
  origin: "http://localhost:3001", // Your Frontend
  credentials: true                // Allows cookies to be sent back and forth
}));

app.use('/auth', AuthRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', ProductRouter);
app.use('/categories', CategoryRouter);
app.use('/orders', orderRouter);
app.use('/wishlists', wishlistRouter);
app.use('/payments', paymentRouter);
app.use('/notifications', notificationRouter);
app.use('/supports', supportRouter);
app.use("/admin", adminRouter);

  // THE SYNC GOES HERE
  // sequelize.sync()
  //   .then(() => {
  //     console.log("Tables reset successfully!!")  ;
  //   })
  //   .catch(err => console.log("Sync Error: ", err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
