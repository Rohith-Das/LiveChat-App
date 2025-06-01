import { useEffect, useState } from 'react'
import { Routes ,Route, Navigate} from 'react-router-dom'
import Navbar from './component/Navbar'
import SignUpPage from './pages/signUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/settingsPage'
import ProfilePage from './pages/ProfilePage'
import HomePage from './pages/HomePage'
import { axiosInstance } from './lib/axios'
import { useAuthStore } from './store/useAuthStore'
import {Loader} from 'lucide-react'
import {Toaster} from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'



function App() {

 const authUser = useAuthStore((state) => state.authUser);
const checkAuth = useAuthStore((state) => state.checkAuth);
const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
const {theme,setTheme}=useThemeStore()

useEffect(() => {
  document.querySelector("html").setAttribute("data-theme", theme);
}, [theme]);
useEffect(() => {
  const storedTheme = localStorage.getItem("chat-theme") || "coffee";
  setTheme(storedTheme);
}, []);


useEffect(() => {
  checkAuth();
}, []);


  if(isCheckingAuth && !authUser) return(
    <div className="flex items-center justify-center h-screen w-screen">
    <Loader className="animate-spin w-10 h-10 text-gray-500" />
  </div>
  )
  return (
<div className="min-h-screen bg-base-100">
     <Navbar/>
   <Routes>
<Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />     <Route path='/login' element={<LoginPage/>}/>
     <Route path='/settings' element={ authUser ? <SettingsPage/> : <Navigate to="/login"/>}/>
     <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login" />}/>
     <Route path='/signup' element={<SignUpPage />} />
   </Routes>
    
    <Toaster/>

  </div>
  )
}

export default App
