var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
	new Product({
		imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51YBn9K7eVL.jpg',
		title: 'The Girl With No Name',
		description: 'A heart-wrenching story from the bestselling author of The Throwaway Children.',
		price: 24
	}),
	new Product({
		imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51XoyAYObXL._SY346_.jpg',
		title: 'A Dark Lure',
		description: 'Twelve years ago, Sarah Baker was abducted by the Watt Lake Killer and sexually assaulted for months before managing to escape.',
		price: 9
	}),
	new Product({
		imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51KRuC%2BmItL._SY346_.jpg',
		title: 'From Sand and Ash',
		description: 'Italy, 1943—Germany occupies much of the country, placing the Jewish population in grave danger during World War II.',
		price: 10
	}),
	new Product({
		imagePath: 'https://images-na.ssl-images-amazon.com/images/I/51oICD9UWKL._SY346_.jpg',
		title: 'Origin: A Novel',
		description: 'The #1 New York Times Bestseller from the author of The Da Vinci Code',
		price: 18
	})
];

var done = 0;

for(var i=0; i<products.length; i++) {
	products[i].save(function(err, result) {
		done++;
		if(done === products.length) {
			exit();
		}
	});
}

function exit() {
	mongoose.disconnect();
}