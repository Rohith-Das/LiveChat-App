

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';

function Navbar() {
  const { logout, authUser } = useAuthStore();

  return (
    <div>
      <header className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-opacity-80'>
        <div className='container mx-auto px-4 h-16'>
          <div className='flex items-center justify-between h-full'>
            {/* Left Side: Logo/Brand */}
            <div className='flex items-center gap-8'>
              <Link to="/" className='flex items-center gap-3 hover:opacity-90 transition-all'>
                {/* Uncomment and adjust logo if desired */}
                {/* <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow'>
                  <img
                    src="/cropLOGOlogo.png"
                    alt="Dev.Chat Logo"
                    className='w-10 h-10 rounded-full object-contain transform hover:scale-105 transition-transform'
                  />
                </div> */}
                <h1 className='text-lg sm:text-xl font-semibold text-base-content/90 font-sans tracking-tight'>
                  Dev.Chat
                </h1>
              </Link>
            </div>

            {/* Right Side: Buttons */}
            <div className='flex flex-row sm:flex-row items-center gap-2 sm:gap-3'>
              <Link
                to="/settings"
                className='btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2'
              >
                <Settings className='w-4 h-4' />
                <span className='hidden sm:inline'>Settings</span>
              </Link>
              {authUser && (
                <>
                  <Link
                    to="/profile"
                    className='btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2'
                  >
                    <User className='w-4 h-4' />
                    <span className='hidden sm:inline'>Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className='btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2'
                  >
                    <LogOut className='w-4 h-4' />
                    <span className='hidden sm:inline'>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;