import React, { useEffect } from 'react';
import Navbar from './Components/Navbar';
import { Route , Routes } from 'react-router-dom';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TestPage from './pages/TestPage.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import {Toaster} from "react-hot-toast";
import { useThemeStore } from './store/useThemeStore.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

const App = () => {
	const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore();
	const {theme} = useThemeStore();

	console.log(onlineUsers)
	useEffect(()=> {
		checkAuth()
	},[checkAuth])

	if(isCheckingAuth && !authUser) return(
		<div className="flex items-center justify-center h-screen">
			<Loader2 className="size-10 animate-spin"/>
		</div>
	)
  	return (
    	<div data-theme={theme}>
        	<Navbar/>
			<Routes>
				<Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
				<Route path='/signup' element={!authUser ? <SignupPage/> : <Navigate to="/"/>}/>
				<Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/"/>}/>
				<Route path='/settings' element={<SettingsPage/>}/>
				<Route path='/test' element={<TestPage/>}/>
				<Route path='/profile' element={authUser ? <ProfilePage/>  : <Navigate to="/login"/>}/>
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password/" element={<ResetPasswordPage />} />
			</Routes>
			<Toaster/>
    	</div>
  	);
};

export default App;