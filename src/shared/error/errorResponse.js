const { StatusCodes } = require("http-status-codes");

class CustomErrorResponse {
  message;
  success;
  error;
  constructor(res, message, status, error) {
    this.message = message;
    this.error = error;
    res.status(status).json(this.getResponse(status));
  }

  getResponse(code) {
    return {
      success: false,
      status: code,
      error:
        this.error && ["object", "string"].includes(typeof this.error)
          ? this.error
          : this.message,
    };
  }
}

class ServerErrorResponse extends CustomErrorResponse {
  constructor(res, error) {
    super(
      res,
      "Internal server error",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error || "Internal Server Error"
    );
  }
}

class ValidationErrorResponse extends CustomErrorResponse {
  constructor(res, error) {
    super(res, "Validation error", StatusCodes.BAD_REQUEST, error);
  }
}

class BadRequestErrorResponse extends CustomErrorResponse {
  constructor(res, message) {
    super(res, String(message), StatusCodes.BAD_REQUEST);
  }
}

class NotFoundErrorResponse extends CustomErrorResponse {
  constructor(res, message) {
    super(res, String(message), StatusCodes.NOT_FOUND);
  }
}

class AuthorizationErrorResponse extends CustomErrorResponse {
  constructor(res, message) {
    super(res, String(message), StatusCodes.UNAUTHORIZED);
  }
}

class PermissionErrorResponse extends CustomErrorResponse {
  constructor(res, message) {
    super(res, String(message), StatusCodes.UNAUTHORIZED);
  }
}

class LimitReachedErrorResponse extends CustomErrorResponse {
  constructor(res, message) {
    super(res, String(message), StatusCodes.FORBIDDEN);
  }
}

module.exports = {
  CustomErrorResponse,
  ServerErrorResponse,
  ValidationErrorResponse,
  BadRequestErrorResponse,
  NotFoundErrorResponse,
  AuthorizationErrorResponse,
  PermissionErrorResponse,
  LimitReachedErrorResponse,
};
