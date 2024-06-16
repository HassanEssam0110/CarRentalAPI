import bcrypt from 'bcryptjs';
import { db } from "../../../DB/connection.js"
import { User } from '../../../DB/Models/user.model.js';
import { sendResponse, sendResponseError } from '../../utils/sendResponse.utils.js';
import { generateToken } from '../../utils/token.utils.js';
import { ObjectId } from 'mongodb';


/**
 * Finds a user by ID with optional password inclusion.
 *
 * @param {string} id - The ID of the user to find.
 * @param {boolean} [includePassword=false] - Whether to include the password in the returned user document. Defaults to false.
 * @returns {Promise<Object|null>} - The user document if found, otherwise null.
 */
export const findUser = async (id, includePassword = false) => {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ _id: new ObjectId(id) }, { projection });
}

export const signup = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 9);
        const dateNow = new Date();
        const result = await User.insertOne({
            name,
            email,
            password: hashedPassword,
            phone,
            createdAt: dateNow,
            updatedAt: dateNow
        });
        if (!result.acknowledged) {
            return sendResponseError(res, 'an error occurred');
        }
        return sendResponse(res, result, 201);
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return sendResponseError(res, 'Invalid email or password', 401);
        }
        const token = generateToken(user._id);
        return sendResponse(res, { user, token });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getLoggedUser = async (req, res, next) => {
    try {
        const user = req.user;
        return sendResponse(res, { user });
    } catch (err) {
        console.log(`error: ${err}`);
        return sendResponseError(res, err.message);
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, { projection: { password: 0 } }).toArray();
        return sendResponse(res, { count: users.length, users });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await findUser(id);
        if (!user) {
            return sendResponseError(res, 'This user not found..', 404);
        }
        return sendResponse(res, { user });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        const userFounded = await findUser(id);
        if (!userFounded) {
            return sendResponseError(res, 'This user does not exist', 404);
        }
        if (userFounded._id.toString() !== req.user._id.toString()) {
            return sendResponseError(res, 'Not allowed to access', 403);
        }
        const user = await User.updateOne({ _id: new ObjectId(id) },
            {
                $set: {
                    name: name || userFounded.name,
                    email: email || userFounded.email,
                    phone: phone || userFounded.phone,
                    updatedAt: new Date()
                }
            });
        return sendResponse(res, { user });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userFounded = await findUser(id);
        if (!userFounded) {
            return sendResponseError(res, 'This user does not exist', 404);
        }
        if (userFounded._id.toString() !== req.user._id.toString()) {
            return sendResponseError(res, 'Not allowed to access', 403);
        }
        const user = await User.deleteOne({ _id: new ObjectId(id) });
        return sendResponse(res, { user });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const changePassword = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { password, newPassword } = req.body;
        const userFounded = await findUser(_id, true);
        if (!userFounded || !await bcrypt.compare(password, userFounded?.password)) {
            return sendResponseError(res, 'invalid credentials', 400);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 9);
        const user = await User.updateOne({ _id: new ObjectId(_id) },
            {
                $set: {
                    password: hashedPassword,
                    passwordChangeAt: new Date()
                }
            });
        return sendResponse(res, { msg: 'please login again', user });
    } catch (err) {
        console.log(`error: ${err}`);
        return sendResponseError(res, err.message);
    }
}


