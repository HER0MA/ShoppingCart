var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
	var successMsg = req.flash('success')[0];
	var products = Product.find(function(err, docs) {
		var productChunks = [];
		var chunkSize = 3;
		for(var i=0; i< docs.length; i+=chunkSize){
			productChunks.push(docs.slice(i, i+chunkSize));
		}
		res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg});
	});
});

router.get('/add-to-cart/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	Product.findById(productId, function(err, product) {
		if(err) {
			return res.redirect('/');
		}
		cart.add(product,product.id);
		req.session.cart = cart;
		console.log(req.session.cart);
		res.redirect('/');
	});
});

router.get('/reduce/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
	var productId = req.params.id;
	var cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.removeAll(productId);
	req.session.cart = cart;
	res.redirect('/shopping-cart');
});


router.get('/shopping-cart', function(req, res, next) {
	if (!req.session.cart) {
		return res.render('shop/shopping-cart', {products: null});
	}
	var cart = new Cart(req.session.cart);
	res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/check-out', isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var cart = new Cart(req.session.cart);
	var errMsg = req.flash('error')[0];//multiple items, is a map
	res.render('shop/check-out', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/check-out',isLoggedIn, function(req, res, next) {
	if (!req.session.cart) {
		return res.redirect('/shopping-cart');
	}
	var stripe = require("stripe")(
	  "sk_test_WtWqk2UG6LlLglyuS9OfXhwv"
	);
	var cart = new Cart(req.session.cart);
	stripe.charges.create({
	  amount: cart.totalPrice * 100,
	  currency: "usd",
	  source: req.body.stripeToken, // obtained with Stripe.js     
	  //check-out.js $form.append($('<input type="hidden" name="stripeToken" />').val(token));
	  description: "Test Charge for Henry's bookStore"
	}, function(err, charge) {
		if (err) {
			req.flash('error',err.message);
			return res.redirect('/check-out');
		}
		var order = new Order({
			user: req.user,//passport will place user in req
			cart: cart,
			address: req.body.address,
			name: req.body.name,
			paymentId: charge.id // read documentation
		});
		order.save(function(err, result) { // save to db
			req.flash('success', 'Successfully bought products!');
			req.session.cart = null; // previously not session, so after purchase, the shopping cart unchanged
			res.redirect('/');
		});
	});
});

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.oldUrl = req.url;
	res.redirect('/user/signin');
}

