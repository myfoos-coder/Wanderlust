const Review = require('../models/review');
const Listing = require('../models/listing');


module.exports.createReview=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    let review=new Review(req.body.review);
    review.author=req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success","New Review created!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview=async(req,res)=>{
    let {id, reviewId}=req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: { _id: reviewId } } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};