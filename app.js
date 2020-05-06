const express = require('express'),
app = express(),
parser = require('body-parser'),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
expressSanitizer = require("express-sanitizer"),
locus = require("locus"),
PORT = process.env.PORT || 5000;


// Connection
const url = "mongodb+srv://root:1234@stonehurstdb-jdyfd.mongodb.net/newsdb";


//App Config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(parser.urlencoded({ extended: true }));
app.use(expressSanitizer());
mongoose.connect(url || 'mongodb://localhost/newsdb', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(methodOverride("_method"));

//Mongoose Config
const newsSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    created: { type: Date, default: Date.now }
});

var Article = module.exports = mongoose.model("Article", newsSchema);


/*
Article.create({
    title: "Test Article",
    image: "https://images.unsplash.com/photo-1586953208479-8684e036d889?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    body: "This is a test article"
},
function (err, article){
    if (err) {
        console.log(err);
    } else {
        console.log('A new article has been created');
        console.log(article);
    }
    });
*/


//ROUTE

//INDEX Route
app.get('/', function(req, res){
    res.redirect('/latestnews');
});

app.get('/latestnews', function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Article.find({title: regex}, function(err, articles){
            if(err){
                console.log(err);
            } else {
                if(articles.length < 1) {
                    noMatch = "No articles match your search query. Please try again."
                }
                res.render("index", {articles: articles, noMatch: noMatch});
            };
        })
    } else {
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        } else {
            res.render("index", {articles: articles, noMatch: noMatch});
        }
    });
}
});

app.get("/about", function(req, res){
    res.render("about");
});

//NEW Route
app.get('/new', function(req, res){
    res.render("new");
});

//CREATE Route
app.post('/latestnews', function (req, res){
//sanitize article - prevent script tags
req.body.article.body = req.sanitize(req.body.article.body);
//create article
Article.create(req.body.article, function (err, newArticle){
if (err){
    res.render("new");
} else {
//If successful, redirect to index and display new blog with others
    res.redirect("/latestnews");
}});
});

//SHOW Route
app.get('/latestnews/:id', function (req, res){
    Article.findById(req.params.id, function (err, foundArticle){
        if (err){
            res.redirect("/latestnews"); //could add page with message article not found
        } else {
            res.render("show", {article: foundArticle});
        }});
});

//EDIT Route
app.get('/latestnews/:id/edit', function (req, res){
    //Find article for edit form
    Article.findById(req.params.id, function(err, foundArticle){
        if (err){
            res.render("/latestnews");
        } else {
            //Edit article form
    res.render("edit", {article: foundArticle});
        }});
    
});

//UPDATE Route
app.put('/latestnews/:id', function (req, res){
    //sanitize article - prevent script tags
req.body.article.body = req.sanitize(req.body.article.body);
    //Locate blog and update with edits
 Article.findByIdAndUpdate(req.params.id, req.body.article, function (err, updatedArticle){
     if(err){
         res.redirect("/latestnews");
     } else {
         res.redirect("/latestnews/" + req.params.id);
     }});
});

//DELETE Route
app.delete("/latestnews/:id", function (req, res){
    //destroy article
    Article.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/latestnews");
        } else {
            //redirect
            res.redirect("/latestnews");
        }});
    
});



//SEARCH FUNCTION
//app.get("/search", function (req, res){
  //  Article.find({$text})
//})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
