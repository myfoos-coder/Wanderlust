const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().trim().min(1).required(),
        price: Joi.number().required().min(0),
        country: Joi.string().required(),
        available: Joi.boolean().required(),
        countryCode: Joi.string().valid("91", "44", "1", "61", "81", "49").required(),
        contactNumber: Joi.string().pattern(/^[0-9]{6,12}$/).required(),
        image: Joi.alternatives().try(
          Joi.object({ url: Joi.string().allow("", null) }).default({ url: "" }),
          Joi.string().allow("", null)
        ).default({ url: "" })
    }).required(),
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5)
    }).required()  })