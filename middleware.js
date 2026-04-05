const Review=require("./models/review.js");
const Listing=require("./models/listing.js");
const ExpressError=require("./utils/ExpressError");
const { listingSchema } = require("./schema");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

const validateListing = (req,res,next) => {
    const { value, error } = listingSchema.validate(req.body, { abortEarly: false });
    if(error){
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(errMsg, 400);
    }
    req.body = value;
    if (req.body.listing && typeof req.body.listing.image === 'string') {
        req.body.listing.image = { url: req.body.listing.image || '' };
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{  
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    if(!listing.owner || !listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};  

module.exports.ReviewAuthor=async(req,res,next)=>{  
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }   
    next();
};  

module.exports.validateListing = validateListing;