import { Router } from 'express';
import { verifyToken } from '../../Middlewares/verifyToken.middleware.js';
import { creatRental, deleteRental, getAllRentals, getRentalById, updateRental } from './rental.controller.js';
import { isvalidId } from './../../Middlewares/validation/id.validation.js';
import { createRentalValidator } from '../../Middlewares/validation/rental.validation.js';

const router = Router();


router.route('/')
    .get(verifyToken, getAllRentals)
    .post(verifyToken, createRentalValidator, creatRental)

router.route('/:id')
    .get(verifyToken, isvalidId, getRentalById)
    .put(verifyToken, isvalidId, updateRental)
    .delete(verifyToken, isvalidId, deleteRental)

export default router;