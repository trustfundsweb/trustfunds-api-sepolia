const joi = require("joi");

const changePasswordValidation = (data) => {
  const schema = joi.object({
    password: joi.string().required(),
    newPassword: joi
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

module.exports = changePasswordValidation;
