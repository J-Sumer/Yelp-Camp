var express = require('express');
var router  = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comments');
var middleware = require('../middleware');


// Get add comment page
router.get('/', middleware.isLoggedIn , (req,res)=>{
	var campground = { _id : req.params.id};
	res.render('comments', {campground});
})


// Add comment to data base
router.post('/' ,middleware.isLoggedIn , (req,res)=>{
	
	Campground.findOne({_id:req.params.id}).populate('comments').exec((err,campground) =>{
		try{
			if(err){
				console.log('Some error' , err);
			}else{
			Comment.create(req.body.comment , (err,thiscomment) =>{
				if(err){
					console.log("Failed to create a comment" , err);
				}else{
					thiscomment.author.id = req.user._id;
					thiscomment.author.username = req.user.username;
					thiscomment.save();
					campground.comments.push(thiscomment._id);	
					campground.save();
					req.flash('success' , 'successfully added a comment');
					res.redirect('/campgrounds/' + campground._id);
				}
			})
		}
		}catch(e){
			console.log("Hre error");
		}
		
	})
	
})


// Editing a comment
router.get("/:campgroundid/edit", middleware.checkCommentOwnership , (req,res)=>{
	Comment.findById(req.params.id , (err,comment)=>{
		if(err){
			cosole.log(err);
		}else{
			res.render('editcomment' , {campgroundid : req.params.campgroundid, comment});
		}
	})
})


// Updating the comment
router.put("/:campgroundid/edit", middleware.checkCommentOwnership , (req,res)=>{
	Comment.findByIdAndUpdate(req.params.id , req.body.comment , (err,comment)=>{
		if(err){
			console.log(err);
		}else{
			req.flash('success' , 'Edited the comment');
			res.redirect('/campgrounds/' + req.params.campgroundid);
		}
	})
})


// Deleting the comment
router.get("/:campgroundid/delete", middleware.checkCommentOwnership , (req,res)=>{
	Comment.findByIdAndDelete(req.params.id , (err,comment)=>{
		if(err){
			console.log(err);
		}else{
			req.flash('success' , 'Deleted the comment');
			res.redirect('/campgrounds/' + req.params.campgroundid);
		}
	})
})

module.exports = router;