import { Router } from "express";
const router = Router();

import * as postsCtrl from '../controllers/posts.controller';
import * as authJwt from '../middlewares/authJwt';

router.post('/', authJwt.verifyToken, postsCtrl.createPost);
router.get('/', authJwt.verifyToken, postsCtrl.getPosts);
router.get('/postsById', authJwt.verifyToken, postsCtrl.getPostsById);
router.get('/:postId', authJwt.verifyToken, postsCtrl.getPostById);
router.put('/:postId', authJwt.verifyToken, postsCtrl.updatePostById);
router.delete('/:postId', authJwt.verifyToken, postsCtrl.deletePostById);



export default router;