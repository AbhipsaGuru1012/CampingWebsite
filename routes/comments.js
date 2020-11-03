const express=require("express");
const router=express.Router({mergeParams:true});
const Campground=require("../models/campgrounds");
const Comment=require("../models/comments");
const middleware=require("../middleware");
//COMMENTS ROUTE-Nested Routes
router.get("/new",middleware.isLoggedIn,function(req,res){
	//find campground by id
	Campground.findById(req.params.id, function(err,campground){
		if(err){
			req.flash("error", "Something went wrong!")
			console.log(err)
		}else{
			res.render("comments/new",{campground:campground})
		}
		
	})
	
})
router.post("/",middleware.isLoggedIn, function(req, res){
	//lookup campground with the id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			req.flash("error", "Something went wrong!")
			console.log(err)
			res.redirect("/campgrounds")
		}else{
			//create a new comment
			Comment.create(req.body.comment,function(err, comment){//body.comment has both text and author as we used like an object in new.ejs
				if(err){
					req.flash("error", "Something went wrong!")
					console.log(err)
					
				}else{
					//add username and id to comment
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment)//here campground is the parameter in the function that we searched for
					campground.save()
					console.log(comment);
					req.flash("Successfully added comment")
					res.redirect("/campgrounds/"+campground._id)
				}
			})
		}
	})
	
})

//Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){//only writing this to check if the id of campground is right, or else our app could crash
		if(err || !foundCampground){
			req.flash("error", "Campground not found!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			}else{
				res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
			}

		})
	})
	
	
})
//Update comment router
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

//Delete comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash("error", "Something went wrong")
			res.redirect("back");
		}else{
			req.flash("success", "Deleted comment successfully!")
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})


module.exports=router;