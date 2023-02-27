import Joi from "joi";
import bcrypt from "bcrypt";

import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken } from "../../models";

const loginController = {
  async login(req, res, next) {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-z0-9]{3,30}$"))
        .required(),
    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      const match = bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return next(
          CustomErrorHandler.wrongCredentials("password does mot matched")
        );
      }

      const access_token = JwtService.sign({ _id: user._id, role: user.role });
      const refresh_token = JwtService.sign(
        { _id: user._id, role: user.role },
        "1y",
        REFRESH_SECRET
      );

      const refresh = await RefreshToken.create({
        refresh_token: refresh_token,
      });
      //   console.log(refresh)
      res.json({ access_token, refresh_token });
    } catch (error) {
      return next(error);
    }
  },
  async logout(req ,res , next) {
  const logoutSchema = Joi.object({
  refresh_token : Joi.string().required()});
  
  const { error } = logoutSchema.validate(req.body);
  
  if(error){
  return next(error)}
  
  try {
   const notfound =  await RefreshToken.deleteOne({refresh_token : req.body.refresh_token});
    console.log(notfound)
    if(notfound.deletedCount === 0){
    return next(CustomErrorHandler.wrongCredentials('token not found'))
    }
  } catch (error) {
    return next(error)
  }
  
  res.json({Success : "Logout successfull...."})
  },
};

export default loginController;
