const { StatusCodes } = require("http-status-codes");

class SuccessResponse {
  constructor(res, message, result) {
    const response = {
      success: true,
      message: message,
    };

    if (result) response.result = result;
    res.status(StatusCodes.OK).send(response);
  }
}

module.exports = SuccessResponse;
