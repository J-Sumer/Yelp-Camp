var express = require('express');
var router  = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


// Get all campgrounds
router.get('/campgrounds' , (req,res)=>{	
	Campground.find({}, (err,campgrounds)=>{
		if(err){console.log("Some error");}
		else{
			res.render('campgrounds' , {campgrounds});
		}
	});
})


// Get the create new campground form
router.get('/newCampground', middleware.isLoggedIn , (req,res)=>{
	res.render('new');
})


// Create a new campground
// router.post('/campgrounds', middleware.isLoggedIn , (req,res)=>{
// 	var author = {
// 		id: req.user._id,
// 		username: req.user.username
// 	};
// 	var name = req.body.name;
// 	var image = req.body.image;
// 	var description = req.body.description;
// 	var cost = req.body.cost;
// 	var newCampground = {name , image , author , description , cost};
// 	Campground.create(newCampground , (err,newcampground)=>{
// 		if(err){
// 			console.log("some error")
// 		}else{
// 			res.redirect('campgrounds');
// 		}
// 	});
// })

//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err);
		console.log(data.length);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

// Get a campground page with details
router.get('/campgrounds/:id', middleware.isLoggedIn , (req,res)=>{
	var id = req.params.id;
	Campground.findOne({_id:id}).populate('comments').exec((err,campground) =>{
		if(err){
			console.log('Some error' , err);
		}else{
			res.render('show', {campground});
		}
	})
})


// Edit a campground
router.get('/campgrounds/:id/edit', middleware.checkCampgroundOwnership , (req,res)=>{	
	Campground.findById(req.params.id , (err,campground)=>{
		if(err){
			console.log(err);
		}else{
			res.render('editcampground' ,{campground});
		}
	})
})


// Updating a campground
// router.put('/campgrounds/:id', middleware.checkCampgroundOwnership , (req,res)=>{
// 	Campground.findByIdAndUpdate(req.params.id , req.body.campground , (err , campground) =>{
// 		if(err){
// 			console.log(err);
// 		}else{
// 			res.redirect('/campgrounds/' + req.params.id);
// 		}
// 	})
// })

// UPDATE CAMPGROUND ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.campgroundlocation, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// Deleting a campground
router.delete('/campgrounds/:id', middleware.checkCampgroundOwnership , (req,res)=>{
	Campground.findByIdAndDelete(req.params.id , (err,campground)=>{
		if(err){
			console.log(err);
		}else{
			res.redirect('/campgrounds');
		}
	})
})


module.exports = router;
