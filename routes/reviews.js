const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn, ReviewAuthor} = require('../middleware');
const reviewController=require("../controller/reviews");    

const validateReview=(req,res,next)=>{
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map(el=>el.message).join(",");
        throw new ExpressError(errMsg, 400);
    }
        else{
            next();
        }
}


//Reviews
//Post Route

router.post("/",
    isLoggedIn,
    validateReview,wrapAsync(reviewController.createReview));

//Delete Route
router.delete("/:reviewId",
    isLoggedIn,
    ReviewAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports=router;