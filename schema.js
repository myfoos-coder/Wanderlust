const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().trim().min(1).required(),
        price: Joi.number().required().min(0),
        country: Joi.string().required(),
        available: Joi.boolean().required(),
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