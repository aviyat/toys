const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ msg: "users work !" })
})


router.post("/", async (req, res) => {
    let validBody = validUser(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let newUser = new UserModel(req.body);
        newUser.password = await bcrypt.hash(newUser.password, 10);
        await newUser.save()
        newUser.password = "*******"
        res.status(201).json(newUser)
    }
    catch (err) {
        if (err.code == 11000) {
            return res.status(500).json({ msg: "Email already exist, try Login!!" })
        }
        console.log(err);
        res.status(500).json({ msg: "error: ", err })
    }
 })

 router.post("/login", async(req,res) => {
    let validBody = validLogin(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details);
    }
    try{
      let user = await UserModel.findOne({email:req.body.email})
      if(!user){
        return res.status(401).json({msg:" email is worng ,code:1"})
      }
      let userPassword = await bcrypt.compare(req.body.password,user.password);
      if(!userPassword){
        return res.status(401).json({msg:"Password  is worng ,code:2"});
      }
      let token = createToken(user._id,user.role);
      res.json({token});
    }
    catch(err){
      console.log(err)
      res.status(500).json({msg:"error:",err})
    }
  })

  router.get("/usersList", authAdmin, async (req, res) => {
    try {
      let data = await UserModel.find({}, { password: 0 });
      res.json(data)
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ msg: "err", err })
    }
  })
module.exports = router;