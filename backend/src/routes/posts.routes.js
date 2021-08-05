import { Router } from "express";
const router = Router();

import * as postsCtrl from '../controllers/posts.controller';
import * as authJwt from '../middlewares/authJwt';

router.post('/', postsCtrl.createPost);
router.get('/', [authJwt.verifyToken], postsCtrl.getPosts);
router.get('/:postId', postsCtrl.getPostById);
router.put('/:postId', postsCtrl.updatePostById);
router.delete('/:postId', postsCtrl.deletePostById);



export default router;