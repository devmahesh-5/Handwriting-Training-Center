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

  const Login = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const userSession = await axios.post('/api/users/login', data);
      if (userSession.status==200) {
        setLoading(false);
        router.push('/users/me');
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
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F2F4F7] p-4">
      <div className="w-full max-w-2xl bg-[#F2F4F7] rounded-2xl shadow-lg p-8">
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-24">
            <Logo />
          </span>
        </div>

        <h2 className="text-center text-3xl font-bold text-[#082741] mb-2">
          Login To Your Account
        </h2>


        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(Login)}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className={`space-y-5`}>
              <Input
                type="email"
                label="Email Address"
                placeholder="rambhadur@gmail.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
              />
              
              <div className="relative">
                <Input
                  type={passwordType}
                  label="Password"
                  placeholder="••••••••"
                  className="pr-10"
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
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] p-1 text-[#6C48E3] hover:text-indigo-600 transition-colors focus:outline-none rounded-md"
                  onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
                  aria-label={passwordType === 'password' ? 'Show password' : 'Hide password'}
                >
                  {passwordType !== 'password' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>Password must contain:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>8-20 characters</li>
                  <li>At least one letter</li>
                  <li>At least one number</li>
                </ul>
              </div>
            </div>

            
          </div>

          <button
            type="submit"
            className="text-[#6C48E3] w-full mt-8 py-3 font-semibold rounded-lg transition-all border border-[#6C48E3]
            bg-white hover:bg-[#6C48E3] hover:text-white focus:ring-2 focus:ring-[#6C48E3] focus:ring-offset-2"
            disabled={Object.keys(errors).length > 0}
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have Account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-[#6C48E3] hover:text-[#5a3acf] transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  ) : (
    <div className={`animate-spin`}>
      <FaSpinner />
    </div>
  )
}