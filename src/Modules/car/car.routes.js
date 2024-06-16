import { Router } from 'express';
import { addCar, changeRentalState, deleteCar, filterQuery, getAllCars, getCarById, getRentedOrSpecificModelCars, getavailableOrRentedModelCars, updateCar } from './car.controller.js';
import { verifyToken } from '../../Middlewares/verifyToken.middleware.js';
import { isvalidId } from '../../Middlewares/validation/id.validation.js';
import { changeStateCarValidator, createCarValidator, updateCarValidator } from '../../Middlewares/validation/car.validation.js';
const router = Router();

router.put('/rental-state', changeStateCarValidator, changeRentalState)
router.get('/rented-or-model', verifyToken, getRentedOrSpecificModelCars);
router.get('/available-or-rented', verifyToken, getavailableOrRentedModelCars)
router.route('/')
    .get(verifyToken, filterQuery, getAllCars)
    .post(verifyToken, createCarValidator, addCar)

router.route('/:id')
    .get(verifyToken, isvalidId, getCarById)
    .put(verifyToken, isvalidId, updateCarValidator, updateCar)
    .delete(verifyToken, isvalidId, deleteCar)

export default router;