const { StatusCodes, getReasonPhrase } = require("http-status-codes");

const pageNotFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: getReasonPhrase(StatusCodes.NOT_FOUND),
    status: StatusCodes.NOT_FOUND,
  });
};

module.exports = pageNotFound;
