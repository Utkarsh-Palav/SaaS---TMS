import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Invalid user"})
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.name, error.message);
        res.clearCookie("token");
        return res.status(403).json({ message: 'Invalid token' });
    }
}

export default verifyToken;