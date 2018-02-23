var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var index = require('./routes/index');
var login = require('./routes/login');
var recommenderDashboard = require('./routes/recommender-dashboard');
var templateDashboard = require('./routes/template-dashboard');
var users = require('./routes/users');
var rec = require('./routes/rec');
var {google} = require('googleapis');
var querystring = require('querystring');
var url = require('url');
var OAuth2 = google.auth.OAuth2;
var createTemplate = require('./routes/create-template');

var app = express();

app.use(cookieSession({
    name: 'session',
    keys: ['d']
}));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

var GOOGLE_CLIENT_ID = "468934162681-cbfmk6ung8pm2jaqsf68r9e24vb888j5.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "5BktU-GsMF8nf-SFmQFD7vSJ";
var oauth2Client = new OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback"
);

app.use("/auth/google/callback", async (req, res, next) => {
  var qs = querystring.parse(url.parse(req.url).query);
  try {
    var r = await oauth2Client.getToken(qs.code);
    oauth2Client.setCredentials(r.tokens);
    req.session.token = r.tokens.access_token;
    return res.redirect('/recommender-dashboard');
    
  } catch (err) {
    next(err);
  }
});


app.use('/logout', (req, res) => {
  req.session.token = null;
  res.redirect('/login');
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);

app.use('/recommender-dashboard', isAuthenticated, recommenderDashboard);
app.use('/template-dashboard', isAuthenticated, templateDashboard)
app.use('/users', isAuthenticated, users);
app.use('/rec', isAuthenticated, rec);
app.use('/create-template', isAuthenticated, createTemplate)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('pages/error');
});

function isAuthenticated(req, res, next) {
  if (req.session.token) {
    res.cookie('token', req.session.token);
    next();
  } else {
    res.cookie('token', '');
    res.redirect('/login');
  }
}


module.exports = app;
