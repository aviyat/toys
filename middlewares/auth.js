const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")



exports.auth = (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        return res.status(401).json({ msg: "you need to send token in url" })
    }
    try {
        let newToken = jwt.verify(token, config.tokenSecret);
        req.tokenData = newToken;
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(401).json({ msg: "the token invalid or expired,try again!!!" })
    }

}
exports.authAdmin = (req,res,next) => {
    let token = req.header("x-api-key");
    if(!token){
      return res.status(401).json({msg:"You need to send token in url2"})
    }
    try{
      let newToken = jwt.verify(token,config.tokenSecret);
      if(newToken.role != "admin"){
        return res.status(401).json({msg:"the token invalid or expired,try again2!!!"})
      }

      req.tokenData = newToken;
  
      next();
    }
    catch(err){
      console.log(err);
      return res.status(401).json({msg:"the token invalid or expired,try again3!!!"})
    }
  }

