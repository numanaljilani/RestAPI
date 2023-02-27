import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import productSchema from "../validators/productValidator";
import { product } from "../models";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 3746674586-836534453.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); // 5mb

const productController = {
  async store(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      const filePath = req.file.path;

      const { error } = productSchema.validate(req.body);

      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        return next(error);
      }

      const { name, size, price } = req.body;
      let document;
      try {
        document = await product.create({
          name,
          size,
          price,
          image: filePath,
        });
      } catch (error) {
        return next(error);
      }
      res.status(201).json(document);
    });
  },

  async update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      const { error } = productSchema.validate(req.body);

      if (error) {
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        return next(error);
      }

      const { name, size, price } = req.body;
      let document;
      try {
        document = await product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            size,
            price,
            ...(filePath && { image: filePath }),
          },
          { new: true }
        );
      } catch (error) {
        return next(error);
      }
      res.status(201).json(document);
    });
  },
  async destroy(req, res, next) {
    let document;
    try {
      document = await product.findOneAndRemove({ _id: req.params.id });

      if (!document) {
        return next(new Error(" nothing to delete"));
      }

      let filePath = document._doc.image;

      fs.unlink(`${appRoot}/${filePath}`, (err) => {
      
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
        res.json(document);
      });
    } catch (error) {
      return next(error);
    }
  },
  async index(req, res, next) {
    let document;
    try {
      document = await product
        .find()
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    
    res.json(document)
  },
  
  async show(req, res, next){
  let document;
  try {
  
  // document = await Product.findOne({ _id : req.params.id})
  document = await product.findOne({_id : req.params.id })
  
  if(!document){
    return next(CustomErrorHandler.notFound('Product not found....'))
    }
    
  } catch (error) {
  console.log(error)
  return next(error)
    
  }
  res.json({document})
  },

  async getProduct(req, res, next) {
    let document;
    try {
      document = await product.find({ _id: { $in: req.body.ids } }).select(
        "-__v -updateAt"
      );
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }

    res.json({ document });
  },
};
export default productController;
