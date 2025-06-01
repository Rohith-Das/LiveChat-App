import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom'; 
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import ThreeAnimation from '../component/ThreeAnimation'; 

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, isLoggingIn } = useAuthStore(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData);
    if (success) {
      setTimeout(() => navigate('/'), 500); 
    }
  };

  return (
    <div className='min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-base-200 to-base-300'>
      {/* Left Side: Login Form */}
      <div className='flex flex-col justify-center items-center p-6 sm:p-12 order-1'>
        <div className='w-full max-w-sm sm:max-w-md space-y-8'>
          {/* Logo and Heading */}
          <div className='text-center mb-8'>
            <div className='flex flex-col items-center gap-3 group'>
              <div className='w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
                <img
                  src='/cropLOGOlogo.png'
                  alt='Dev.Chat Logo'
                  className='w-12 h-12 rounded-full object-contain transform group-hover:scale-105 transition-transform'
                />
              </div>
              <h1 className='text-2xl sm:text-3xl font-bold mt-2 text-base-content'>
                Welcome Back
              </h1>
              <p className='text-base-content/60 text-sm sm:text-base'>
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium text-base-content/80'>
                  Email
                </span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-base-content/40' />
                </div>
                <input
                  type='email'
                  className='input input-bordered w-full pl-10 shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium text-base-content/80'>
                  Password
                </span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-base-content/40' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='input input-bordered w-full pl-10 shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-base-content/40' />
                  ) : (
                    <Eye className='h-5 w-5 text-base-content/40' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='btn btn-primary w-full shadow-md hover:shadow-lg hover:bg-primary/90 transition-all bg-gradient-to-r from-primary to-primary/80'
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' /> Loading...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className='text-center'>
            <p className='text-base-content/60 text-sm sm:text-base'>
              Don’t have an account?{' '}
              <Link to='/signup' className='link link-primary font-medium hover:underline'>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Animation */}
      {/* <div className='h-[50vh] lg:h-full order-2'>
        <ThreeAnimation />
      </div> */}
    </div>
  );
}