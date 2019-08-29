# Mongodb-ejs

> How to connect with mongodb,express using nodejs and display json by ejs.

## Build Setup

Node.js - https://nodejs.org/en/

MongoDB - https://www.mongodb.com/download-center?jmp=nav#community

Get started by creating a new folder for this project, and name it anything you like. Then, inside that folder, create additional folders and files to match the following structure:

``` bash
├── routes
|    └── main.js
├── models
|    └── product.js
├── views
|    ├── main
|    |    ├── products.ejs
|    |    └── add-product.ejs
|    └── index.ejs
└── server.js
```
and install necessary dependencies to work:

``` bash
npm install --save mongoose express body-parser ejs 
```
Create a Server and Connect to MongoDB
Open ```index.js``` file and create simple express.js server and we create connection to MongoDB, enable body-parser middleware for parse incoming request bodies and use ejs template engine.

Declare Collection and Fill DataBase
Before create routes to filling our database we need declare model for products collection. Products will have a name, category name, price and cover image.

``` bash
var express = require('express')
var ejs = require('ejs')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var app = express()

#Model declaration

var Product = mongoose.model('product',{
    category: String,
    name: String,
    price: Number,
    cover: String
});

# Connecting to mongodb server
mongoose.connect('mongodb://localhost:27017/article', {useNewUrlParser: true})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

# we are using ejs template engine so set app like below
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
                res.render('main/products', {
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

```

## Explanation:

perPage variable contains max number of items on each page, page variable contains current page number.

First we are finding all documents in Products collection:

``` bash
Product.find({}) 
```
for each page we need to skip ``` ((perPage * page) - perPage)```values (on the first page the value of the skip should be 0):

``` bash
.skip((perPage * page) - perPage)
```

output only perPage items (9 in this case):

``` bash
.limit(perPage)
```
count all items in collection with count() (we will use this value to calculate the number of pages):
``` bash
Product.count().exec(function(err, count) {
    ...
```
then render main/products page and send necessary data:
``` bash
res.render('main/products', {
    products: products,
    current: page,
    pages: Math.ceil(count / perPage)
})
```
Create pagination page:

Open views/products.ejs and paste following EJS:
``` bash
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <div class="row">
            <% for (var i = 0; i < products.length; i++) { %>
                <div class="col-md-4">
                    <div class="thumbnail">
                        <img src="<%= products[i].cover %>">
                        <div class="caption">
                            <h3><%= products[i].name %></h3>
                            <p><%= products[i].category %></p>
                            <p>$<%= products[i].price %></p>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
            <% if (pages > 0) { %>
                <ul class="pagination text-center">
                    <% if (current == 1) { %>
                        <li class="disabled"><a>First</a></li>
                    <% } else { %>
                        <li><a href="/products/1">First</a></li>
                    <% } %>
                    <% var i = (Number(current) > 5 ? Number(current) - 4 : 1) %>
                    <% if (i !== 1) { %>
                        <li class="disabled"><a>...</a></li>
                    <% } %>
                    <% for (; i <= (Number(current) + 4) && i <= pages; i++) { %>
                        <% if (i == current) { %>
                            <li class="active"><a><%= i %></a></li>
                        <% } else { %>
                            <li><a href="/products/<%= i %>"><%= i %></a></li>
                        <% } %>
                        <% if (i == Number(current) + 4 && i < pages) { %>
                            <li class="disabled"><a>...</a></li>
                        <% } %>
                    <% } %>
                    <% if (current == pages) { %>
                        <li class="disabled"><a>Last</a></li>
                    <% } else { %>
                        <li><a href="/products/<%= pages %>">Last</a></li>
                    <% } %>
                </ul>
            <% } %>
    </div>
</body>
</html>

```
## Explanation:

We will show pagination only if number of pages more than 0:

``` bash
<% if (pages > 0) { %>
```
In this part of code:
``` bash
<% var i = (Number(current) > 5 ? Number(current) - 4 : 1) %>
```
we are check number of current page and if this value less than 5 we are output pagination links from 1 to current_page + 4:

``` bash
<% for (; i <= (Number(current) + 4) && i <= pages; i++) { %>
```
and if this value more than 5 we will start output pagination link from current_page - 4 to current_page + 4, thus previous links on current_step - 5 will be hide.

Additional condition && i <= pages in for loop we are using for not to display the number of links more than the number of pages.
``` bash
<% if (i !== 1) { %>
    <li class="disabled"><a>...</a></li>
<% } %>
```
we check the number from which we begin the output and if this number not qual to 1 (read above) we are prepend ... (to show that we have previous links).

The same way we are using at the end:
``` bash
<% if (i == Number(current) + 4 && i < pages) { %>
    <li class="disabled"><a>...</a></li>
<% } %>

to append ... to show that we have links ahead.

# Finally at start and the end of pagination we toggle active of Fist and Last links:

<% if (current == 1) { %>
    <li class="disabled"><a>First</a></li>
<% } else { %>
    <li><a href="/page/1">First</a></li>
<% } %>

...

<% if (current == pages) { %>
    <li class="disabled"><a>Last</a></li>
<% } else { %>
    <li><a href="/page/<%= pages %>">Last</a></li>
<% } %>
```
Now you can run MongoDB with mongod command, node server.js command, go to http://localhost:8080/generate-fake-data to insert data to MongoDB and use pagination on http://localhost:8080/products/1 page.