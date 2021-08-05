import { Router } from "express";
const router = Router();

import * as authCtrl from '../controllers/auth.controller';
import * as authJwt from '../middlewares/authJwt';

router.post('/signUp', authCtrl.signUp);
router.post('/signIn', authCtrl.signIn);
router.get('/checkToken', authJwt.verifyToken, authCtrl.checkToken);



export default router;