const Listing = require("../models/listing");

module.exports.index=async (req, res) => {
    let { q } = req.query;

    let allListings;

    if (q) {
        allListings =await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ]
  });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, q });
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }  }).populate("owner");
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
    
};


module.exports.createListing = async (req,res,next) => {
    if (!req.file) {
      req.flash("error", "Please upload an image for the listing.");
      return res.redirect("/listings/new");
    }

    const location = req.body.listing.location.trim();
    if (!location) {
      req.flash("error", "Please provide a valid location.");
      return res.redirect("/listings/new");
    }

    req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
 
    await newListing.save();
    req.flash("success","New Listing created!");
    res.redirect("/listings");
};


module.exports.renderEditForm=async(req,res)=>{
    let {id} =req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
    let {id} = req.params;
    const updateData = { ...req.body.listing };
    if (!req.file && updateData.image && updateData.image.url === "") {
        delete updateData.image;
    }
    let updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (typeof req.file !== "undefined") {
        updatedListing.image = { url: req.file.path, filename: req.file.filename };
        await updatedListing.save();

    
    }



    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing deleted successfully!");
    res.redirect("/listings");
};

