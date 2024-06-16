import { ObjectId } from "mongodb";
import { sendResponseError } from "../../utils/sendResponse.utils.js";


export const createCarValidator = async (req, res, next) => {
    try {
        const { name, model } = req.body;
        if (!name || !model) {
            return sendResponseError(res, 'name and model are required');
        }
        if (name.length < 2 || name.length > 25) {
            return sendResponseError(res, 'car name must be between 2 and 25 characters');
        }
        if (model.length < 3) {
            return sendResponseError(res, 'model must be at least 3 characters long');
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};
export const updateCarValidator = async (req, res, next) => {
    try {
        const { name, model } = req.body;
        if (name && (name.length < 2 || name.length > 25)) {
            return sendResponseError(res, 'car name must be between 2 and 25 characters');
        }
        if (model && (model.length < 3)) {
            return sendResponseError(res, 'model must be at least 3 characters long');
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};
export const changeStateCarValidator = async (req, res, next) => {
    try {
        const { carId, rentalStatus } = req.body;
        if (!carId || !rentalStatus) {
            return sendResponseError(res, 'Car ID and rental status are required', 400);
        }
        if (!ObjectId.isValid(carId)) {
            return sendResponseError(res, 'Invalid mongoID format', 400);
        }
        if (rentalStatus != 'available' && rentalStatus != 'rented') {
            return sendResponseError(res, 'Invalid rental status, only available or rented', 400);
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};