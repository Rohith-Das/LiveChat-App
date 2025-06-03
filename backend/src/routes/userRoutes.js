 import express from 'express'
import { protectRoute } from "../middlewares/auth.middleware.js"
import { getUsers } from '../Controllers/userController.js';
const router = express.Router();

router.get("/", protectRoute, getUsers);


export default router