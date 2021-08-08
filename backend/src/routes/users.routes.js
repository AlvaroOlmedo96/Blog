import { Router } from "express";
import * as multer from '../middlewares/multer';
const router = Router();

import * as userCtrl from '../controllers/users.controller';
import * as authJwt from '../middlewares/authJwt';

router.get('/users', authJwt.verifyToken, userCtrl.getUsers);
router.get('/userName', authJwt.verifyToken, userCtrl.getUserByName);
router.get('/userId/:id', authJwt.verifyToken, userCtrl.getUserById);
router.post('/updateProfile', authJwt.verifyToken, userCtrl.updateProfile);
router.post('/updateProfileImages', authJwt.verifyToken, multer.uploadSingleConf, userCtrl.updateProfileImg);


router.get('/getProfileImages', authJwt.verifyToken, userCtrl.getProfileImages);

export default router;