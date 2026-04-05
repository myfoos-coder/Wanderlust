const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController=require("../controller/listing");
const multer=require("multer");
const { storage } = require("../cloudConfig.js"); // Import the Cloudinary storage configuration
const upload = multer({ storage: storage }); // Use the Cloudinary storage configuration

router
       .route("/")
       .get(wrapAsync(listingController.index))
       .post(isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing));

// router
//         .route("/search")
//         .get(wrapAsync(listingController.searchListings));
        
router
        .route("/new") 
        .get(isLoggedIn,listingController.renderNewForm);

       

router
        .route("/:id")
        .get(wrapAsync(listingController.showListing))
        .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
        .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


router
        .route("/:id/edit")
        .get(isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

 

module.exports=router;