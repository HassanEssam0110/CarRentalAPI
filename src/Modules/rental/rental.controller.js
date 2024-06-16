import { ObjectId } from "mongodb";
import { Rental } from "../../../DB/Models/rental.model.js";
import { sendResponse, sendResponseError } from "../../utils/sendResponse.utils.js";
import { findCar } from "../car/car.controller.js";
import { Car } from "../../../DB/Models/car.model.js";


export const findRental = async (id) => {
    return await Rental.findOne({ _id: new ObjectId(id) });
};


// ?==>API endpoint 

export const creatRental = async (req, res, next) => {
    try {
        const { carId, rentalDate, returnDate } = req.body;
        const userId = req.user._id;
        const dateNow = new Date();
        const rental = await Rental.insertOne(
            {
                carId: new ObjectId(carId),
                customerId: new ObjectId(userId),
                rentalDate: new Date(rentalDate),
                returnDate: new Date(returnDate),
                createdAt: dateNow,
                updatedAt: dateNow
            }
        );

        if (!rental.acknowledged) {
            return sendResponseError(res, 'Failed to create rental');
        };
        // Update car rental status
        await Car.updateOne({ _id: new ObjectId(carId) }, {
            $set: {
                rentalStatus: 'rented',
                updatedAt: dateNow
            }
        });

        return sendResponse(res, { rental }, 201);
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};

export const getAllRentals = async (req, res, next) => {
    try {
        const rentals = await Rental.aggregate([
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carId',
                    foreignField: '_id',
                    as: 'car'
                }
            },
            {
                $unwind: '$car'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $project: {
                    _id: 1,
                    rentalDate: 1,
                    returnDate: 1,
                    customer: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone: 1
                    },
                    car: {
                        _id: 1,
                        name: 1,
                        model: 1,
                    }
                }
            }
        ]).toArray();
        return sendResponse(res, { count: rentals.length, rentals });
    }
    catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};

export const getRentalById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rental = await Rental.aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'cars',
                    localField: 'carId',
                    foreignField: '_id',
                    as: 'car'
                }
            },
            {
                $unwind: '$car'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                },
            },
            {
                $unwind: '$customer'
            },
            {
                $project: {
                    _id: 1,
                    rentalDate: 1,
                    returnDate: 1,
                    updatedAt: 1,
                    customer: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        phone: 1
                    },
                    car: {
                        _id: 1,
                        name: 1,
                        model: 1,
                    }
                }
            }
        ]).toArray();

        if (!rental) {
            return sendResponseError(res, 'This rental not found..', 404);
        }
        return sendResponse(res, { rental })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};

export const updateRental = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rentalDate, returnDate, carId } = req.body;
        // Find the existing rental
        const rentalFounded = await findRental(id);
        if (!rentalFounded) {
            return sendResponseError(res, 'This rental not found..', 404);
        }
        // Check if the car ID is changing
        if (carId && (carId !== rentalFounded.carId.toString())) {
            // Update the old car's rental status to 'available'
            await Car.updateOne({ _id: new ObjectId(rentalFounded.carId) }, { $set: { rentalStatus: 'available' } })
            // Update the new car's rental status to 'rented'
            await Car.updateOne({ _id: new ObjectId(carId) }, { $set: { rentalStatus: 'rented' } });
        }
        const updatedRenral = await Rental.updateOne({ _id: new ObjectId(id) }, {
            $set: {
                rentalDate: rentalDate ? new Date(rentalDate) : rentalFounded.rentalDate,
                returnDate: returnDate ? new Date(returnDate) : rentalFounded.returnDate,
                carId: carId ? new ObjectId(carId) : rentalFounded.carId,
                updatedAt: new Date()
            }
        });
        // If no document was updated, return an error
        if (updatedRenral.matchedCount === 0) {
            return sendResponseError(res, 'Failed to update rental', 400);
        }
        return sendResponse(res, { rental: updatedRenral })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const deleteRental = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rentalFounded = await findRental(id);
        if (!rentalFounded) {
            return sendResponseError(res, 'This rental not found..', 404);
        }
        // Update the rental status of the car to 'available'
        const rental = await Rental.deleteOne({ _id: new ObjectId(id) });
        if (rental.deletedCount === 0) {
            return sendResponseError(res, 'Failed to delete rental', 400);
        }
        // Update the rental status of the car to 'available'
        await Car.updateOne({ _id: rentalFounded.carId }, { $set: { rentalStatus: 'available' } });
        return sendResponse(res, { rental });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
};