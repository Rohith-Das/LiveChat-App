import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";

function HomePage() {
    const { authUser, followUser, unfollowUser } = useAuthStore();
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                const res = await axiosInstance.get("/users/top-followed");
                setTopUsers(res.data);
            } catch (error) {
                toast.error("Failed to load suggestions");
            }
        };
        fetchTopUsers();
    }, []);

    const handleFollow = async (userId) => {
        const success = await followUser(userId);
        if (success) {
            setTopUsers((prev) =>
                prev.map((user) =>
                    user._id === userId
                        ? { ...user, followers: [...user.followers, authUser._id] }
                        : user
                )
            );
        }
    };

    const handleUnfollow = async (userId) => {
        const success = await unfollowUser(userId);
        if (success) {
            setTopUsers((prev) =>
                prev.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              followers: user.followers.filter(
                                  (id) => id !== authUser._id
                              ),
                          }
                        : user
                )
            );
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Suggested Users</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topUsers.map((user) => (
                    <div
                        key={user._id}
                        className="card bg-base-100 shadow-xl p-4"
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={user.profilePic || "https://via.placeholder.com/50"}
                                alt={user.fullName}
                                className="w-12 h-12 rounded-full"
                            />
                            <div>
                                <h2 className="font-semibold">{user.fullName}</h2>
                                <p className="text-sm text-base-content/60">
                                    {user.followers.length} followers
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            {user.followers.includes(authUser._id) ? (
                                <>
                                    <button
                                        className="btn btn-outline btn-sm mr-2"
                                        onClick={() => handleUnfollow(user._id)}
                                    >
                                        <UserMinus className="w-4 h-4" /> Unfollow
                                    </button>
                                    <Link
                                        to={`/chat/${user._id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Chat
                                    </Link>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleFollow(user._id)}
                                >
                                    <UserPlus className="w-4 h-4" /> Follow
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;