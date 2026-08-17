import express from 'express';
import { getAllUsers, createUser, signIn } from './user.controller.js';
import { validateUserRegistration } from '../../middlewares/validation.js';
import { imageextension } from '../../constants/constants.js';
import { multermiddleware } from '../../middlewares/multer.middleware.js';
import{authenticate} from '../../middlewares/authentication-middleware.js'
import { createPost, deletePost, getAllPosts } from '../../posts/posts,controllers.js';
import {  addReaction,removeReaction} from '../../reacts/reactscontrollers.js';
const router = express.Router();


router.get('/', getAllUsers);

router.post('/register', validateUserRegistration, createUser);


router.post('/login', signIn);

router.patch(
  '/upload-profile',
 
  multermiddleware( imageextension).single('profile'),
  (req, res) => {
    
    res.status(200).json({ success: true, message: 'Profile picture uploaded successfully' });
  }
);
router.post('/creatpost', createPost);
router.get('/getuserpost', authenticate, getAllPosts);
router.delete('/:id', authenticate, deletePost);


router.post('/', authenticate, addReaction);
router.delete('/', authenticate, removeReaction);

export default router;