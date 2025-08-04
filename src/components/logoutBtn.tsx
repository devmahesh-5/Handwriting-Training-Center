'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/store/authSlice';
import { useDispatch } from 'react-redux';
import { MdLogout } from 'react-icons/md';
import axios from 'axios';
const LogoutBtn = () => {
    // const handle
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(false);
    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/api/users/logout');
            dispatch(logout());
            router.push('/auth/login');
        } catch (error) {
            console.error(error);
        }finally {
            setLoading(false);
        }
    }

    return !loading ? (
  <button 
    className="bg-[#6C48E3] hover:bg-gray-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer inline-flex items-center"
    onClick={handleLogout}
  >
    <MdLogout className="inline-block w-4 h-4 mr-1.5" />
    
  </button>
) : (
  <button 
    className="bg-gray-400 text-white text-sm font-medium py-1.5 px-3 rounded-md cursor-not-allowed inline-flex items-center" 
    disabled
  >
    <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </button>
);
};

export default LogoutBtn;