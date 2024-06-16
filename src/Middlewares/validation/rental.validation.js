import { sendResponseError } from "../../utils/sendResponse.utils.js";
import { findCar } from "../../Modules/car/car.controller.js";
import { ObjectId } from "mongodb";


export const createRentalValidator = async (req, res, next) => {
    try {
        const { carId, rentalDate, returnDate } = req.body;

        if (!carId || !rentalDate || !returnDate) {
            return sendResponseError(res, 'carId , rentalDate and returnDate are required');
        }
        if (!ObjectId.isValid(carId)) {
            return sendResponseError(res, 'Invalid mongoID format', 400);
        }
        // Validate rentalDate and returnDate
        if (rentalDate && isNaN(Date.parse(rentalDate))) {
            return sendResponseError(res, 'Invalid rental date', 400);
        }
        if (returnDate && isNaN(Date.parse(returnDate))) {
            return sendResponseError(res, 'Invalid return date', 400);
        }

        // Check if the car is available
        const car = await findCar(carId);
        if (!car) {
            return sendResponseError(res, 'Car not found', 404);
        }
        if (car.rentalStatus !== 'available') {
            return sendResponseError(res, 'Car is already rented', 400);
        }

        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};