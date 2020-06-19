var express = require('express');
var router = express.Router();
require('dotenv').config();

//Initialize mongodb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://PatrickH99:bikebike99@bikecluster-edfu6.mongodb.net/test";

/* GET index page */
router.get('/', function (req, res, next) {
  res.render('index',
    {
      pageTitle: "Why RentBike",
      pageText: "Just rent a bike fast and easy at Rentbike. We guarantee you a safe drive at any time for the lowest price in the market."
    });
});

/* GET contact page */
router.get('/contact', function (req, res, next) {
  res.render('contact',
    {
      msg: null,
      pageTitle: "Contact",
      pageText: "Feel free to contact us whenever you want."
    });
});

/* GET bikes page */
router.get('/bikes', async function (req, res, next) {
  console.log("test");
  var bikes = new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("data");
      dbo.collection("bikes").find({}).toArray(function (err, result) {
        if (err) throw err;
        db.close();
        resolve(result);
      });
    })
  }).then(function (result) {
    res.render('bikes',
      {
        bikes: result,
        pageTitle: "Our Bikes",
        pageText: "Look at all the great bikes and find the bike of your dreams."
      });
  })
});

/* GET shoppingcart page */
router.get('/shoppingcart', function (req, res, next) {
  res.render('shoppingcart',
    {
      msg: null,
      pageTitle: "Shopping Cart",
      pageText: "You are one click away from you dream bike!"
    });
});

/* GET checkout page */
router.get('/checkout', function (req, res, next) {
  res.render('checkout');
});

/* GET admin page */
router.get('/admin', function (req, res, next) {
  if (!req.session.viewCount) {
    req.session.viewCount = 1;
  } else {
    req.session.viewCount += 1;
  }
  res.render('admin',
    {
      viewCount: req.session.viewCount,
      pageTitle: "Admin",
      pageText: "Welcome home boss."
    });
});

/* GET dashboard page */
router.get('/dashboard', async function (req, res, next) {
  console.log("test");
  var bikes = new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("data");
      dbo.collection("bikes").find({}).toArray(function (err, result) {
        if (err) throw err;
        db.close();
        resolve(result);
      });
    })
  }).then(function (result) {
    res.render('partials/dashboard',
      {
        bikes: result
      });
  })
});

exports.index = function (req, res) {
  res.render('index');
};

module.exports = router; 