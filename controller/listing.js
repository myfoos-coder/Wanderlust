const Listing=require("../models/listing");
const { config, geocoding } = require("@maptiler/client");
const mapToken = process.env.MAPTILER_KEY;

if (!mapToken) {
  throw new Error("Missing MAPTILER_KEY environment variable. Set it in .env or your deployment environment.");
}

config.apiKey = mapToken;

// module.exports.index=async (req,res)=>{
//     const allListings=await Listing.find({});
//     res.render("listings/index.ejs", {allListings});
//     };

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
    const location = req.body.listing.location;
    const result = await geocoding.forward(location, { limit: 1 });

    // console.log(result.features[0].geometry);

    if (!result.features?.length) {
      req.flash("error", "Could not geocode the provided location.");
      return res.redirect("/listings/new");
    }

    req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = result.features[0].geometry;
 
    await newListing.save();
    req.flash("success","New Listing created!");
    res.redirect("/listings");
};

// module.exports.searchListings = async (req, res) => {
//   const query = req.query.q;
//   const results = await Listing.find({
//     $or: [
//       { title: { $regex: query, $options: "i" } },
//       { country: { $regex: query, $options: "i" } }
//     ]
//   });
// //   console.log(results);
//   res.render("listings/search.ejs", { results, query });
// };

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
    // if (!updatedListing.location) {
    //     const location = updateData.location || updatedListing.location;
    //     if (location) {
    //         const result = await geocoding.forward(location, { limit: 1 });
    //         if (result.features?.length) {
    //             updatedListing.geometry = result.features[0].geometry;
    //             await updatedListing.save();
    //         } else {
    //             console.warn("Could not geocode the provided location during update:", location);
    //         }
    //     }
    // }


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

