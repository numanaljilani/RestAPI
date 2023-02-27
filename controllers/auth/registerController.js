import Joi, { ref } from "joi";
import bcrypt from "bcrypt";


import { User } from "../../models";
import CustomErrorHandler from '../../services/CustomErrorHandler'
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from '../../config'
// CHECKLIST
// [ ] validate the request
// [ ] authorise the request
// [ ] check if user is in the database already
// [ ] prepare model
// [ ] store in database
// [ ] generate jwt token
// [ ] send response

const registerController = {
  async register(req, res, next) {
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeat_password: ref("password"),
    });

    const { error } = registerSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const exist = await User.exists({ email: req.body.email });

      if (exist) {
        return next(CustomErrorHandler.alreadyExist("This user already exist"));
      }
    } catch (error) {
      return next(error);
    }

    const { name, email, password } = req.body;
    const hashed_password = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed_password,
    });
    
    let access_token;
    let refresh_token;
    
    try {
    const result  = user.save();
    console.log(user);
    
    access_token = JwtService.sign({ _id : result._id , role : result.role })
    refresh_token = JwtService.sign({ _id : result._id , role : result.role }, '1y' ,REFRESH_SECRET)
        
    } catch (error) {
        return next(error);
    }

    res.json({ access_token , refresh_token });
  },
};

export default registerController;
