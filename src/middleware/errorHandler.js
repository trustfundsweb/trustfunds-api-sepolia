const { StatusCodes } = require("http-status-codes");
const CustomError = require("../shared/error/customError");

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  if (err instanceof CustomError) {
    return res
      .status(err.status)
      .json({ error: err.message, status: err.status, success: false });
  }
  res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
    error: err.message,
    status: StatusCodes.SERVICE_UNAVAILABLE,
    success: false,
  });
};

module.exports = errorHandler;
