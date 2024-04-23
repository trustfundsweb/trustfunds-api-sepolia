const joi = require("joi");

const registerValidation = (data) => {
  const schema = joi.object({
    name: joi.string().min(4).required(),
    email: joi.string().min(6).email().required(),
    password: joi
      .string()
      .required()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$"
        )
      ),
  });
  return schema.validate(data);
};

module.exports = registerValidation;
