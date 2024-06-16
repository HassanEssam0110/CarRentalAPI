import { ObjectId } from "mongodb";
import { sendResponseError } from "../../utils/sendResponse.utils.js";

export const isvalidId = (req, res, next) => {
    // Check if id is a valid ObjectId
    if (!ObjectId.isValid(req.params.id)) {
        return sendResponseError(res, 'Invalid mongoID format', 400);
    }
    next();
}