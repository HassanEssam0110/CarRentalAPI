import { Router } from 'express';
import { changePassword, deleteUser, getAllUsers, getLoggedUser, getUser, signin, signup, updateUser } from './user.controller.js';
import { signinValidator, signupValidator, updateValidator } from '../../Middlewares/validation/user.validation.js';
import { isvalidId } from './../../Middlewares/validation/id.validation.js';
import { verifyToken } from '../../Middlewares/verifyToken.middleware.js';

const router = Router();

router.post('/signup', signupValidator, signup)
router.post('/signin', signinValidator, signin)
router.post('/changePassword', verifyToken, changePassword)
router.get('/getMe', verifyToken, getLoggedUser)

router.route('/')
    .get(verifyToken, getAllUsers)


router.route('/:id')
    .get(verifyToken, isvalidId, getUser)
    .put(verifyToken, isvalidId, updateValidator, updateUser)
    .delete(verifyToken, isvalidId, deleteUser)

export default router;