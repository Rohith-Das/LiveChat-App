

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { LogOut, Settings, User,MessageSquare } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

function Navbar() {
  const { logout, authUser } = useAuthStore();
const { theme } = useThemeStore()

  return (
    <div>
      <header className=" border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-opacity-80">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Left Side: Logo/Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all">
                <h1 className="text-lg sm:text-xl font-semibold text-base-content/90 font-sans tracking-tight">
                  Dev.Chat
                </h1>
              </Link>
            </div>

            {/* Right Side: Buttons */}
            <div className="flex flex-row sm:flex-row items-center gap-2 sm:gap-3">
              {authUser && (
                <>
                  <Link
                    to="/chat"
                    className={`btn btn-sm  shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2`}
                  style={{ backgroundColor: theme.accent }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2"
                  style={{ backgroundColor: theme.accent }}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2"
                  style={{ backgroundColor: theme.accent }}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline"> {authUser?.fullName ||'profile'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="btn btn-sm btn-primary shadow-sm hover:shadow-md hover:bg-primary/80 transition-all rounded-full flex items-center gap-2"
                  style={{ backgroundColor: theme.accent }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
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