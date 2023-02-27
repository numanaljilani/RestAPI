import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
const userController = {
  async me(req, res, next) {
  const user = await User.find({_id : req.user._id}).select('-__v -updatedAt -password');
  if(!user){
  return next(CustomErrorHandler.notFound());
  }
  
  res.json(user)
  },
};


export default userController;