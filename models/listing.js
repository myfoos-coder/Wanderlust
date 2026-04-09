const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
      filename: String,
  },
  price: Number,
  location: String,
  country: String,
  available: {
    type: Boolean,
    default: true,
  },
  countryCode: {
    type: String,
    default: "91",
  },
  contactNumber: {
    type: String,
    required: true,
  },
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
});

listingSchema.post("findOneAndDelete", async function (listing) {
  if(listing){
  await review.deleteMany({ _id: { $in: listing.reviews } });
}
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
