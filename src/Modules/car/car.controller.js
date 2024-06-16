import { Car } from "../../../DB/Models/car.model.js";
import { ObjectId } from "mongodb";
import { sendResponse, sendResponseError } from "../../utils/sendResponse.utils.js";


export const findCar = async (id) => {
    return await Car.findOne({ _id: new ObjectId(id) });
}

const findCars = async (filterObj = {}) => {
    return await Car.find(filterObj).toArray()
}

export const filterQuery = async (req, res, next) => {
    try {
        const { model, status } = req.query;
        // Initialize filter object
        req.filterObj = {};
        // Add model filter if it exists
        if (model) {
            const modelList = model.split(',');
            req.filterObj.model = { $in: modelList };
        }
        // Add rental status filter if it exists
        if (status) {
            req.filterObj.rentalStatus = { $eq: status };
        }
        next();
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}


// ?==>API endpoint 

export const addCar = async (req, res, next) => {
    try {
        const { name, model } = req.body;
        const dateNow = new Date();
        const car = await Car.insertOne({
            name,
            model,
            rentalStatus: 'available',
            createdAt: dateNow,
            updatedAt: dateNow
        });
        if (!car.acknowledged) {
            return sendResponseError(res, 'an error occurred');
        }
        return sendResponse(res, { car }, 201);
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getAllCars = async (req, res, next) => {
    try {
        const filter = req.filterObj;
        const cars = await findCars(filter);
        return sendResponse(res, { count: cars.length, cars })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getRentedOrSpecificModelCars = async (req, res, next) => {
    try {
        const { model } = req.body;
        const cars = await findCars({
            $or: [
                { rentalStatus: 'rented' },
                { model },
            ]
        });
        return sendResponse(res, { count: cars.length, cars })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getavailableOrRentedModelCars = async (req, res, next) => {
    try {
        const { model } = req.body;
        const cars = await findCars({
            $or: [
                { model, rentalStatus: 'available' },
                { model, rentalStatus: 'rented' },
            ]
        });
        return sendResponse(res, { count: cars.length, cars })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const getCarById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const car = await findCar(id);
        if (!car) {
            return sendResponseError(res, 'not found car', 404);
        }
        return sendResponse(res, { car })
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const updateCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, model } = req.body;
        const carFound = await findCar(id);
        if (!carFound) {
            return sendResponseError(res, 'This car not found..', 404);
        }
        const updateCar = await Car.updateOne({ _id: new ObjectId(id) },
            {
                $set: {
                    name: name || carFound.name,
                    model: model || carFound.model,
                    updatedAt: new Date()
                }
            });
        return sendResponse(res, { car: updateCar });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const deleteCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const carFounded = await findCar(id);
        if (!carFounded) {
            return sendResponseError(res, 'This car not found', 404);
        }
        const car = await Car.deleteOne({ _id: new ObjectId(id) });
        return sendResponse(res, { car });
    } catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}

export const changeRentalState = async (req, res, next) => {
    try {
        const { carId, rentalStatus } = req.body;
        const car = await findCar(carId);
        if (!car) {
            return sendResponseError(res, 'Car not found', 404);
        }
        const updateCar = await Car.updateOne({ _id: new ObjectId(carId) },
            {
                $set: {
                    rentalStatus,
                    updatedAt: new Date()
                }
            });
        if (updateCar.modifiedCount === 0) {
            return sendResponseError(res, 'Failed to update rental status');
        }
        return sendResponse(res, { car: updateCar });
    }
    catch (err) {
        console.log(`error: ${err.message}`);
        return sendResponseError(res, err.message);
    }
}