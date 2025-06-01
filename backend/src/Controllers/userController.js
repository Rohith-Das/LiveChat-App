import User from "../models/userModel.js";

export const followUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const followId = req.params.id;

        if (userId.toString() === followId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(followId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.following.includes(followId)) {
            user.following.push(followId);
            targetUser.followers.push(userId);
            await user.save();
            await targetUser.save();
        }

        res.status(200).json({ message: "Followed successfully" });
    } catch (error) {
        console.log("Error in followUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const unfollowId = req.params.id;

        if (userId.toString() === unfollowId) {
            return res.status(400).json({ message: "Cannot unfollow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(unfollowId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        user.following = user.following.filter(id => id.toString() !== unfollowId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        console.log("Error in unfollowUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTopFollowedUsers = async (req, res) => {
    try {
        const users = await User.find()
            .sort({ followers: -1 })
            .limit(10)
            .select("fullName profilePic _id followers");
        res.status(200).json(users);
    } catch (error) {
        console.log("Error in getTopFollowedUsers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getFirstTenUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } })
            .sort({ createdAt: 1 }) 
            .limit(10)
            .select("fullName profilePic _id followers")
            .lean()
            .exec();
        const usersWithFollowerCount = users.map(user => ({
            ...user,
            followerCount: user.followers ? user.followers.length : 0,
        }));
        res.status(200).json(usersWithFollowerCount);
    } catch (error) {
        console.log("Error in getFirstTenUsers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

