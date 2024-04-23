const Joi = require("joi");
const causesList = require("../campaignModel");

const campaignCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    story: Joi.array().items(Joi.string()).required(),
    goal: Joi.number().required(),
    endDate: Joi.string().required(),
    image: Joi.string().uri().required(),
    causeType: Joi.string().required(),
    milestones: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          date: Joi.string().required(),
          funds: Joi.number().required(),
        })
      )
      .min(2)
      .required(),
  });
  return schema.validate(data);
};

module.exports = campaignCreationValidation;
