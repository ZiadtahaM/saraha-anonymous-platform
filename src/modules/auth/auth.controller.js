import { Router } from 'express';
// import { signupserv } from '../../services/auth.service.js';
import * as authserv from ' ../../services/auth.service.js'
const router =Router()

router.post('/signup', authserv.signupserv)
 export default router