

import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, Loader2, Mail, Pencil, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file)

    reader.onload=async()=>{
      const base64Image=reader.result;
       setSelectedImage(base64Image)
      await updateProfile({profilePic:base64Image})
     

      try {
        await updateProfile({profilePic:base64Image})
      } catch (error) {
         console.error('Upload failed:', error);
        setSelectedImage(null);
      }
    }
   
  };

  const handleRemoveImage=async()=>{
    try {
      setSelectedImage(null);
      await updateProfile({profilePic:""})
      toast.success("profile picture removed successfully")
    } catch (error) {
       console.error('Remove failed:', error);
      toast.error("Failed to remove profile picture");
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-base-200 to-base-300 pt-16 pb-8'>
      <div className='max-w-md sm:max-w-lg lg:max-w-2xl mx-auto p-4 sm:p-6'>
        {/* Main Card Container */}
        <div className='bg-base-100/50 backdrop-blur-sm shadow-xl rounded-xl p-6 sm:p-8 animate-fade-in'>
          {/* Heading */}
          <div className='text-center mb-6'>
            <h1 className='text-2xl sm:text-3xl font-bold text-base-content'>
              Profile
            </h1>
            <p className='mt-2 text-base-content/60 text-sm sm:text-base'>
              Your Profile Information
            </p>
          </div>

          {/* Avatar Upload Section */}
          <div className='flex flex-col items-center gap-4 mb-8'>
            <div className='relative group'>
              <img
                src={selectedImage || authUser?.profilePic || '/user.png'}
                alt='Profile'
                className='size-24 sm:size-32 rounded-full object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-all'
              />
              <label
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90 ${
                  isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''
                }`}
              >
                <Camera color='blue' className='w-5 h-5' />
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                  ref={fileInputRef}
                />
              </label>

              {/* remove button  */}
              {(authUser?.profilePic || selectedImage)&&(
                <button onClick={handleRemoveImage}
                disabled={isUpdatingProfile}
                className={`absolute top-0 right-0 bg-red-500 p-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-600 
                ${isUpdatingProfile ?'pointer-events-none opacity-50' :""}`}>
 <X className='w-3 h-3 text-white' />
                </button>
              )}
            </div>
            <p className='text-sm text-base-content/60'>
              {isUpdatingProfile
                ? 'Uploading...'
                : 'Click the camera icon to update your photo'}
            </p>
          </div>

          {/* User Information */}
          <div className='space-y-6'>
            {/* Full Name */}
            <div className='space-y-1.5'>
              <div className='text-sm text-base-content/60 flex items-center gap-2'>
                <User className='w-4 h-4' />
                Full Name
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border border-base-300 text-base-content'>
                {authUser?.fullName}
              </p>
            </div>

            {/* Email Address */}
            <div className='space-y-1.5'>
              <div className='text-sm text-base-content/60 flex items-center gap-2'>
                <Mail className='w-4 h-4' />
                Email Address
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border border-base-300 text-base-content'>
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className='mt-8 bg-base-200 rounded-xl p-4 sm:p-6 shadow-inner'>
            <h2 className='text-lg sm:text-xl font-medium mb-4 text-base-content'>
              Account Information
            </h2>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between py-2 border-b border-base-300'>
                <span className='text-base-content/80'>Member Since</span>
                <span className='text-base-content'>
                  {authUser?.createdAt?.split('T')[0] || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}