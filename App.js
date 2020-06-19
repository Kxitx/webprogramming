var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const session = require('express-session');

require('dotenv').config();

//initialisierung mongodb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://PatrickH99:bikebike99@bikecluster-edfu6.mongodb.net/test";

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false,
}));

/*CONTACT FORM*/
app.post('/send', function (req, res) {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: "rentbike99@gmail.com", // gmail user
      pass: "mannheim99!"  // gmail password
    },
  });

  // setup email data
  let mailOptions = {
    from: '"Contact Form" rentbike99@gmail.com', // sender adress
    to: 'rentbike99@gmail.com', // receiver adress
    subject: req.body.subject, // subject line
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.render('contact', { msg: 'Something went wrong! Please try again.' });
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);

    //render message to html
    res.render('contact', { msg: 'Your mail has been sent successfully!', pageTitle: "Contact", pageText: "Feel free to contact us whenever you want." });
  });
});
/* END CONTACT FORM*/

/* CHECKOUT */
app.post('/checkout', function (req, res) {

  //test if everything is filled out correct
  if (!req.body.email) {
    res.render('shoppingcart', { msg: 'Please fill out the email field', pageTitle: "Shopping Cart", pageText: "Just rent a bike fast and easy at Rentbike. We guarantee you a safe drive at any time for the lowest price in the market." });
  } else if (req.body.payment === "Paypal") {
    res.render('shoppingcart', { msg: 'Paypal is not supported at the moment', pageTitle: "Shopping Cart", pageText: "Just rent a bike fast and easy at Rentbike. We guarantee you a safe drive at any time for the lowest price in the market." });
  } else {

    //if yes, checkout
    const output = `
    <h3>Thank you for your order!</h3>
  `;

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      auth: {
        user: "rentbike99@gmail.com", // gmail user
        pass: "mannheim99!"  // gmail password
      },
    });

    let mailOptions = {
      from: '"RentBike Mannheim" rentbike99@gmail.com', // sender adress
      to: req.body.email, // receiver adress
      subject: "Your order", // subject line
      html: output // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Message sent');
      }

    })

    //getting the order items
    items = req.body.info.split(",,");
    items.splice(0, 1);

    //data base entry for the order
    items.forEach(function (item) {
      arr = item.split(",");
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        var myobj = { bike: arr[0], startDate: arr[2], endDate: arr[3], amount: arr[1], mail: req.body.email };
        dbo.collection("orders").insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("document inserted")
        });
      })
    })
    //update availabitlity for bikes
    items.forEach(function (item) {
      arr = item.split(",");
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("data");
        dbo.collection("bikes").findOne({ bike: arr[0] }).then(function (result) {
          dbo.collection("bikes").updateOne({ bike: arr[0] }, { $set: { available: result.available - arr[1] } });
          console.log(result.available + " ;; " + arr[1]);
        })
      })
    })
    console.log(items);
    res.render('checkout');
  }
});

/* END CHECKOUT */

/* RESET DATABASE */
app.post('/resetDb', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("data");
    dbo.collection("orders").remove({});

    dbo.collection("bikes").find({}).forEach(function (bike) {
      dbo.collection("bikes").updateOne({ _id: bike._id }, { $set: { available: bike.amount } });
    })
  })
  res.render('admin', { viewCount: req.session.viewCount, pageTitle: "Admin", pageText: "Welcome home boss." });
});
/* END RESET DATABASE */

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      pageTitle: "Error 404",
      pageText: "Seems like you are on the wrong track!"
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;