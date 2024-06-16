
import { sendResponseError } from "../utils/sendResponse.utils.js";
import jwt from 'jsonwebtoken';
import { findUser } from "../Modules/user/user.controller.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(" ")[1];
        if (!token) {
            return sendResponseError(res, 'Access denied. No token provided.', 401);
        }

        // check if the valid 
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // check if user is exist.
        const currentUser = await findUser(decoded.userId)

        if (!currentUser) {
            return sendResponseError(res,'The user that belong to this token does no longer exist.', 401);
        }

        // check if password change after creat token 
        if (currentUser.passwordChangeAt) {
            const passChangedAimestamp = parseInt(currentUser.passwordChangeAt.getTime() / 1000, 10);
            if (passChangedAimestamp > decoded?.iat) {
                return sendResponseError(res, 'User recently changed his password. please login again..', 401);
            }
        }

        req.user = currentUser;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return sendResponseError(res, 'Invalid Token, please login again.', 401);
        }
        else if (err.name === 'TokenExpiredError') {
            return sendResponseError(res, 'Expired Token, please login again.', 401);
        } else {
            console.log(`error: ${err.message}`);
            return sendResponseError(res, err.message, 500);
        }
    }
}