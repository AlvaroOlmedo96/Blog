import { Router } from "express";
import * as multer from '../middlewares/multer';
const router = Router();

import * as userCtrl from '../controllers/users.controller';
import * as authJwt from '../middlewares/authJwt';

router.get('/users', authJwt.verifyToken, userCtrl.getUsers);
router.get('/userName', authJwt.verifyToken, userCtrl.getUserByName);
router.get('/userId', authJwt.verifyToken, userCtrl.getUserById);
router.get('/usersById', authJwt.verifyToken, userCtrl.getUsersById);
router.post('/updateProfile', authJwt.verifyToken, userCtrl.updateProfile);
router.post('/updateProfileImages', authJwt.verifyToken, multer.uploadSingleImage, userCtrl.updateProfileImg);

router.get('/getProfileImages', authJwt.verifyToken, userCtrl.getProfileImages);

router.post('/friendRequest', authJwt.verifyToken, userCtrl.friendRequest);
router.post('/acceptFriendRequest', authJwt.verifyToken, userCtrl.acceptFriendRequest);
router.post('/declineFriendRequest', authJwt.verifyToken, userCtrl.declineFriendRequest);
router.post('/getNotifications', authJwt.verifyToken, userCtrl.getNotificationsById);

router.get('/getChat', authJwt.verifyToken, userCtrl.getChat);
router.post('/sendMessage', authJwt.verifyToken, userCtrl.sendMessage);

export default router;