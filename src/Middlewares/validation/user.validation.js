import { User } from "../../../DB/Models/user.model.js";
import { sendResponseError } from "../../utils/sendResponse.utils.js";


// Validate email function
const validateEmail = (email) => {
    const emailRegex = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
    return emailRegex.test(email);
};

export const signupValidator = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !password || !email || !phone) {
            return sendResponseError(res, 'Name, email, password, and phone are required', 400);
        }
        if (name.length < 3 || name.length > 20) {
            return sendResponseError(res, 'Username must be between 3 and 20 characters', 400);
        }
        if (!validateEmail(email)) {
            return sendResponseError(res, 'Invalid email');
        }
        if (password.length < 6) {
            return sendResponseError(res, 'Password must be at least 6 characters long', 400);
        }
        if (phone.length !== 11) {
            return sendResponseError(res, 'Invalid phone must be 11 number', 400);
        }
        // check if user is already existing
        const userFounded = await User.findOne({ email });
        if (userFounded) {
            return sendResponseError(res, 'user already exists', 404);
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }

};

export const signinValidator = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!password || !email) {
            return sendResponseError(res, ' email and password are required');
        }
        if (!validateEmail(email)) {
            return sendResponseError(res, 'Invalid email');
        }
        if (password.length < 6) {
            return sendResponseError(res, 'Password must be at least 6 characters long');
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};

export const updateValidator = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        if (name && (name.length < 3 || name.length > 20)) {
            return sendResponseError(res, 'Username must be between 3 and 20 characters');
        }
        if (email && !validateEmail(email)) {
            return sendResponseError(res, 'Invalid email');
        }
        if (phone && phone.length !== 11) {
            return sendResponseError(res, 'Invalid phone must be 11 number');
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};