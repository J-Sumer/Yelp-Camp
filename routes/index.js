var express = require('express');
var router  = express.Router();
var passport = require('passport');
var User = require('../models/users.js')

router.get('/' , (req,res)=>{
	res.render('landing');
})

router.get('/register' , (req,res)=>{
	res.render('register');
})

router.post('/register' , (req,res)=>{
	var newUser = new User({username :req.body.username});
	User.register(newUser , req.body.password, function(err,user){
		if(err){
			
// 			{ MissingPasswordError: No password was given
// 			at Promise.resolve.then (/workspace/webdevbootcamp/yelpCamp/node_modules/passport-local-mongoose/index.js:103:17)
// 			at process._tickCallback (internal/process/next_tick.js:68:7)
// 			name: 'MissingPasswordError',
// 			message: 'No password was given' }

			// Above is the err we get so we use err.message to show the error.
			req.flash('error' , err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req,res,function(){
			req.flash('success' , 'Yelp Camp welcomes you ' + user.username);
			res.redirect('/campgrounds');
		})
	})
})

router.get('/login',(req,res)=>{
	res.render('login')
})

router.post('/login', passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"
}), (req,res)=>{})

router.get('/logout', (req,res)=>{
	req.logout();
	req.flash('success' , 'logged out successfully');
	res.redirect('/campgrounds');
})


module.exports = router;