import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
const refreshController = {
  async refresh(req, res, next) {
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });

    const { error } = refreshSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    let refreshToken;

    try {
      refreshToken = await RefreshToken.findOne({
        token: req.body.refresh_token,
      });
      if (!refreshToken) {
        return next(CustomErrorHandler.unAuthorized("Invlid token"));
      }
      console.log(refreshToken)

      let userId;
      try {
        const { _id } = await JwtService.verify(
          refreshToken.refresh_token,
          REFRESH_SECRET
        );
        
        userId = _id;
        console.log(userId)
      } catch (error) {
        return next(error);
      }
      
      const user = await User.findOne({ _id : userId});
      if(!user){
      return next(CustomErrorHandler.unAuthorized('user not found'))
      }
      
      const access_token = JwtService.sign({_id : user._id , role : user.role})
      const refresh_token = JwtService.sign({_id : user._id , role : user.role},'1y',REFRESH_SECRET)
      
      await RefreshToken.create({token : refreshToken });
      res.json({access_token , refresh_token})
    } catch (error) {
    
    return next(new Error('something went wrong' + error.message))
    }
  },
};

export default refreshController;
