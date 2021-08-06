import { Router } from "express";
const router = Router();

import * as userCtrl from '../controllers/users.controller';
import * as authJwt from '../middlewares/authJwt';

router.get('/users', authJwt.verifyToken, userCtrl.getUsers);
router.get('/userName', authJwt.verifyToken, userCtrl.getUserByName);
router.get('/userId/:id', authJwt.verifyToken, userCtrl.getUserById);



export default router;