import mongoose from "mongoose";

const refresh_tokenSchema  = new mongoose.Schema({
refresh_token : { type : String , unique : true }
} , { timestamps : false });

export default mongoose.model('RefreshToken' , refresh_tokenSchema , 'RefreshTokens');