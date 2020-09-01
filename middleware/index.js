var Campground = require('../models/campground');
var Comment = require('../models/comments');


var middlewareObj={};

// To check whether user is logged in or not
middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error' , 'please login');
	res.redirect('/login');
}


// To check whether campground belongs to the user
middlewareObj.checkCampgroundOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id , (err,campground)=>{
			if(err){
				req.flash('error' , 'Campground not found');
				res.redirect('back');
			}else{
				if(campground.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash('error', 'You don\'t have permission to do that');
					res.redirect('back');
				}
			}
		})
	}else{
		res.redirect('back');
	}
}


// To check whether comment belongs to the user
middlewareObj.checkCommentOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.id , (err,comment)=>{
			if(err){
				console.log(err);
				res.redirect('back');
			}else{
				if(comment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash('error', 'You don\'t have permission to do that');
					res.redirect('back');
				}
			}
		})
	}else{
		res.redirect('back');
	}
}

module.exports = middlewareObj;