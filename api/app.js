require('dotenv').config({path: __dirname + '/.env'});

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
app.use(allowCrossDomain);

// Routing
const router = require('./routes/router');
app.use('/', router);

// View engine setup
// Not really used though...
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  console.log('Error :(', err.message);
  var errMsg = "Error: " + err.message;

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Return API error message
  errMsg = toErrorMsg(errMsg);
  res.send(errMsg);
});

const errorHandler = function(err, req, res, next){
  console.log(err.stack);
};

const toErrorMsg = function (errMsg) {
  let _errMsg = errMsg.split(':');
  let HTTP_Response = {
    error: _errMsg[1].trim()
  };
  return JSON.stringify(HTTP_Response);
};

app.use(errorHandler);

if (process.env.hasOwnProperty('CERT_PATH_PUBLIC')) {
  // Certificate
  const privateKey = fs.readFileSync(process.env.CERT_PATH_PRIVATE, 'utf8');
  const certificate = fs.readFileSync(process.env.CERT_PATH_PUBLIC, 'utf8');
  const ca = fs.readFileSync(process.env.CERT_PATH_PUBLIC, 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  // Start http & https servers
  const httpsServer = https.createServer(credentials, app);
  const httpServer = http.createServer(app);

  httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
  });
  
  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
} else {
  // Start http server
  const httpServer = http.createServer(app);
  httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
  });
}

module.exports = app;
