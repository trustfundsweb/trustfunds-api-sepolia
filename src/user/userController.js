const { StatusCodes } = require("http-status-codes");
const SuccessResponse = require("../shared/success/successResponse");
const {
  ValidationErrorResponse,
  ServerErrorResponse,
  CustomErrorResponse,
  BadRequestErrorResponse,
} = require("../shared/error/errorResponse");
const {
  hashPassword,
  comparePassword,
  clearCookie,
  attachCookie,
} = require("./utils/auth.utils");
const { createJwt } = require("./utils/jwt.utils");
const registerValidation = require("./validations/register-user");
const loginValidation = require("./validations/login-user");
const userModel = require("./userModel");

const register = async (req, res) => {
  try {
    const { body } = req;
    // validating user data
    const e = registerValidation(body);
    console.log(e);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);
    // checking if user present
    const user = body;
    const isUserPresent = await userModel.findOne({
      email: user.email,
    });
    if (isUserPresent)
      return new CustomErrorResponse(
        res,
        "User already registered!",
        StatusCodes.CONFLICT
      );
    // hashing password & saving user
    const hashedPassword = await hashPassword(user.password);
    const newUser = new userModel({ ...user, password: hashedPassword });
    await newUser.save();
    return new SuccessResponse(res, "User registered successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const login = async (req, res) => {
  try {
    const { body } = req;
    // validating user data
    const e = loginValidation(body);
    console.log(e);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);
    // checking if user present
    const { email, password } = body;
    const user = await userModel.findOne({ email });
    console.log(user);
    if (!user)
      return new CustomErrorResponse(
        res,
        "User not registered. Register first!",
        StatusCodes.CONFLICT
      );

    // checking password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return new CustomErrorResponse(
        res,
        "Wrong password or email. Please enter correct credentials!",
        StatusCodes.BAD_REQUEST
      );

    const t = createJwt(
      {
        id: user._id,
      },
      process.env.TOKEN_EXPIRE,
      process.env.TOKEN_SECRET
    );
    console.log(t, process.env.TOKEN_SECRET);
    attachCookie(t, res, "token");
    console.log(res.cookie);
    return new SuccessResponse(res, "User logged in successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { body } = req;
    const { id } = req.user;
    // validating user data
    const e = loginValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);
    // checking if user present
    const { password, newPassword } = body;
    const user = await userModel.findOne({ id });
    if (!user)
      return new CustomErrorResponse(
        res,
        "User not found. Login and try again later!",
        StatusCodes.CONFLICT
      );

    // checking password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return new CustomErrorResponse(
        res,
        "Wrong password. Please enter correct credentials!",
        StatusCodes.BAD_REQUEST
      );

    // hashing password & saving user
    const hashedPassword = await hashPassword(newPassword);
    const newUser = new userModel({ ...user, password: hashedPassword });
    await newUser.save();
    return new SuccessResponse(res, "Password changed successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const logout = async (req, res) => {
  clearCookie(res, "token");
  res.status(200).json({ message: "User logged out successfully!" });
};

const user = async (req, res) => {
  try {
    const { user } = req;
    const data = await userModel.findById(user.id);
    if (!data) return new BadRequestErrorResponse(res, "User not found!");
    const temp = {
      _id: data._id,
      name: data.name,
      email: data.email,
      metamask: data.metamask || null,
    };
    return new SuccessResponse(res, "User found successfully!", temp);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const linkMetamask = async (req, res) => {
  try {
    const { user } = req;
    const data = await userModel.findById(user.id);
    if (!data) return new BadRequestErrorResponse(res, "User not found!");

    const { metamaskAddress } = req.body;
    data.metamask = metamaskAddress;
    await data.save();

    const temp = {
      _id: data._id,
      name: data.name,
      email: data.email,
      metamask: data.metamask,
    };
    return new SuccessResponse(res, "User found successfully!", temp);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

module.exports = {
  register,
  login,
  changePassword,
  logout,
  user,
  linkMetamask,
};
