import { Router } from "express";
import * as multer from '../middlewares/multer';
const router = Router();

import * as postsCtrl from '../controllers/posts.controller';
import * as authJwt from '../middlewares/authJwt';

router.post('/', authJwt.verifyToken, postsCtrl.createPost);
router.get('/', authJwt.verifyToken, postsCtrl.getPosts);
router.get('/postsById', authJwt.verifyToken, postsCtrl.getPostsById);

router.post('/uploadPostImage', authJwt.verifyToken, multer.uploadSingleImage, postsCtrl.uploadPostImage);
router.get('/imagesPosts', authJwt.verifyToken, postsCtrl.getImagesOfPosts);


export default router;