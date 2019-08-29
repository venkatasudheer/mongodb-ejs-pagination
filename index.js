var express = require('express')
var ejs = require('ejs')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var Product = mongoose.model('product',{
    category: String,
    name: String,
    price: Number,
    cover: String
});
var app = express()

mongoose.connect('mongodb://localhost:27017/article', {useNewUrlParser: true})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.set('view engine', 'ejs')


app.get('/:page', function(req, res, next) {
    var perPage = 9
    var page = req.params.page || 1

    Product
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, products) {
            Product.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('products', {
                    products: products,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        })
})

app.listen(8000, function() {
    console.log('Node.js listening on port ' + 8000)
})