require('dotenv').config();

var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comments');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/users');
var methodOverride = require('method-override');
var flash = require('connect-flash');

// Importing routes
var campgroundsRoutes = require('./routes/campgrounds');
var commentsRoutes = require('./routes/comments');
var indexRoutes = require('./routes/index');

// connecting to db
mongoose.connect('mongodb://localhost:27017/yelp_camp', {useNewUrlParser:true , useUnifiedTopology:true ,useFindAndModify:false});

app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

app.use(require("express-session")({
	secret : "secret Key",
	resave : false,
	saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.errorMsg = req.flash('error');
	res.locals.successMsg = req.flash('success');
	next();
})

// using routes
app.use(campgroundsRoutes);
app.use('/comments/:id',commentsRoutes);
app.use(indexRoutes);

app.listen(3000 , ()=>{
	console.log("listening on PORT 3000");
})