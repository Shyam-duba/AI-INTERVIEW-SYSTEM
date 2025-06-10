const {validateToken} = require("../config/jwtValidation");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ "message": "Access denied, login first" });
    }

    try {
        const tokenWithoutBearer = token.replace("Bearer ", "").trim(); // ✅ Correct token format
        const verified = validateToken(tokenWithoutBearer);

        console.log(verified)
        req.user = verified;
        next();
    } catch (err) {
        console.error("JWT Validation Error:", token);
        return res.status(403).json({ "message": "Unauthorized" });
    }
};

module.exports = {authMiddleware};
