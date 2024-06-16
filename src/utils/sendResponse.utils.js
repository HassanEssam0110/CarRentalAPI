/**
 * Sends a JSON response with a given status code and data.
 *
 * @param {object} res - The response object from Express.
 * @param {object} data - The data to be included in the response.
 * @param {number} [code=200] - The HTTP status code for the response.
 * @returns {object} - The JSON response object with the specified status code and data.
 */
export const sendResponse = (res, data, code = 200) => {
    return res.status(code).json({ status: 'success', ...data })
}


/**
 * Sends an error response with the given message and status code.
 *
 * @param {object} res - The Express response object.
 * @param {string} msg - The error message to send in the response.
 * @param {number} [code=400] - The HTTP status code for the response. Defaults to 400 if not provided.
 */
export const sendResponseError = (res, msg, code = 500) => {
    return res.status(code).json({ status: 'Failed', msg })
}