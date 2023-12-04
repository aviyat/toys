const mongoose=require("mongoose");
const Joi = require("joi");


let toySchema=new mongoose.Schema({
    name:String,
    description:String,
    category:String,
    image:String,
    price:Number,
    date:{
        type:Date, default:Date.now()
      },
      user_id:String
})
exports.ToyModel = mongoose.model("toys", toySchema);

exports.validateToy = (_reqBody) => {
    let schemaJoi = Joi.object({
      name:Joi.string().min(2).max(99).required(),
      description:Joi.string().min(2).max(199).required(),
      category:Joi.string().min(1).max(99).required(),
      image:Joi.string().min(2).max(199).allow(null,""),
      price:Joi.number().min(2).max(1000).required()
    })
    return schemaJoi.validate(_reqBody)
  }
  