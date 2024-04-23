const Joi = require("joi");
const causesList = require("../campaignModel");

const campaignUpdationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().optional().empty(""),
    title: Joi.string().optional().empty(""),
    story: Joi.array().items(Joi.string()).optional().empty(),
    goal: Joi.number().optional(),
    endDate: Joi.date().optional(),
    image: Joi.string().uri().optional().empty(""),
    causeType: Joi.string()
      .valid(...causesList)
      .optional()
      .empty(""),
  });
  return schema.validate(data);
};

module.exports = campaignUpdationValidation;
