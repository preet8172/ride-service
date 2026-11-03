const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect =  async ( req, res, next ) =>{
    try{
        const authorization = req.headers.authorization;

        if(!authorization||!authorization.startwith("Bearer ")) {
            return res.status(401).json({
                message:"Authorization Token required" 
            });
        }

        const Token =  authorization.split(" ") [1];

        const  decoded = jwt.verify(
            Token,
            process.env.JWT_SECRET,
        );

    const user = await User.findById(decoded.id).select("-password");

   if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;