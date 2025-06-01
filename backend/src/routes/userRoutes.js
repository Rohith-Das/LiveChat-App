 import express from 'express'
import { protectRoute } from "../middlewares/auth.middleware.js"
 import { followUser,getTopFollowedUsers,unfollowUser ,getFirstTenUsers} from '../Controllers/userController.js';

const router = express.Router();

router.post("/follow/:id", protectRoute, followUser);
router.post("/unfollow/:id", protectRoute, unfollowUser);
router.get("/top-followed", protectRoute, getTopFollowedUsers);
router.get("/first-ten", protectRoute, getFirstTenUsers);




export default router