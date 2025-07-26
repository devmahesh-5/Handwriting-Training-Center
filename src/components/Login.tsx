"use client"
import Logo from '@/components/LOGO';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Input from '@/components/Input';

type LoginFormFields = {
  email: string;
  password:string;
};

export default function LoginPage() {
  const router = useRouter();
  const [passwordType, setPasswordType] = useState<"password" | "text">("password");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors } // Access validation errors
  } = useForm<LoginFormFields>({
    mode: "onBlur" // Validate fields when they lose focus
  });
  const [loading, setLoading] = useState<boolean>(false);

  const Login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const userSession = await axios.post('/api/users/login', data);
      if (userSession.status==200) {
        setLoading(false);
        router.push('/');
      }
      toast.success("User SignIn successful");
    } catch (error: any) {
      console.error("error occurred", error);
      setError(error?.response?.data?.message || "Login failed");
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

return !loading ? (
  <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 border border-gray-100 dark:bg-gray-800">
      <div className="mb-8 flex justify-center">
        <span className="inline-block w-28">
          <Logo />
        </span>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1 dark:text-white">
          Welcome back
        </h2>
        <p className="text-gray-500 text-sm dark:text-[#F2F4F7]">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2 flex-shrink-0" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(Login)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#F2F4F7]">
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              className={`text-black block w-full px-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors dark:bg-[#F2F4F7] dark:text-[#F2F4F7] dark:placeholder-[#F2F4F7] dark:bg-gray-800`}
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#F2F4F7]">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={passwordType}
              className={`block w-full px-3 py-2.5 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors text-black`}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                validate: (value) => {
                  if (value.length < 8) return "At least 8 characters";
                  if (value.length > 20) return "Maximum 20 characters";
                  if (!/[A-Za-z]/.test(value)) return "Must include a letter";
                  if (!/\d/.test(value)) return "Must include a number";
                  return true;
                }
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 transition-colors"
              onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
              aria-label={passwordType === 'password' ? 'Show password' : 'Hide password'}
            >
              {passwordType === 'password' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          ) : (
            <div className="mt-2 text-xs text-gray-500">
              <p>Password requirements:</p>
              <ul className="pl-4 list-disc list-inside space-y-0.5">
                <li>8-20 characters</li>
                <li>At least one letter and number</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-[#F2F4F7]">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${Object.keys(errors).length > 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={Object.keys(errors).length > 0}
        >
          Sign in
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2] bg-white text-gray-500 dark:text-[#F2F4F7] dark:bg-gray-800">
              Don't have an account?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/signup"
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:text-[#F2F4F7] dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  </div>
) : (
  <div className="w-full min-h-screen flex items-center justify-center">
    <div className="animate-spin h-10 w-10 text-indigo-600">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  </div>
);
}