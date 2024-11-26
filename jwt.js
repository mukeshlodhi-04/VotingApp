const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next) => {
    const auth = req.headers.authorization
    if(!auth){
        return res.status(404).json({message: 'not found jwt token'})
    }
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({message: "token not found"})
        
    }
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        res.status(400).json({message: error});
    }
}

module.exports = jwtAuthMiddleware;