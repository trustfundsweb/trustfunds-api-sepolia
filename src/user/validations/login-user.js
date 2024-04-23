const joi = require("joi");

const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = loginValidation;
