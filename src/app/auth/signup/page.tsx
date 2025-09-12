"use client"
import Logo from '@/components/LOGO';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { generateUsername } from 'unique-username-generator';
import Input from '@/components/Input';
import Select from '@/components/Select';

type SignupFormFields = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  gender: string;
  profilePicture?: FileList | null;
  role: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [passwordType, setPasswordType] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignupFormFields>({
    defaultValues: { username: generateUsername() },
    mode: "onBlur"
  });
  const [loading, setLoading] = useState(false);

  const signUp = async (data: SignupFormFields) => {

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    formData.append("gender", data.gender);
    formData.append("username", data.username);
    formData.append("role", data.role);
    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append("profilePicture", data.profilePicture[0]);
    }
    try {
      setLoading(true);
      setError(null);
      const userSession = await axios.post('/api/users/register', formData);

      router.push('/auth/login');

      toast.success("Account created successfully!");
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setError(error instanceof AxiosError ? error.response?.data?.message : "Signup failed");
      toast.error(error instanceof AxiosError ? error.response?.data?.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return !loading ? (
    <div className={`w-full min-h-screen flex items-center justify-center p-4 bg-light-200 dark:bg-[#0f0d23]`}>

      <div className={`w-full max-w-4xl rounded-xl shadow-md p-8`}>
        <div className="mb-8 flex justify-center">
          <span className="inline-block w-28">
            <Logo />
          </span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-primary dark:text-[#F2F4F7]">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#F2F4F7]">
            Join our platform and start your journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm flex items-center text-red-600 bg-red-200">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(signUp)} className="space-y-6 dark:text-[#F2F4F7]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <Input
                type="text"
                label="Full Name"
                placeholder="John Doe"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
                error={errors.fullName?.message}
              />

              <Input
                type="email"
                label="Email Address"
                placeholder="harke@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                error={errors.email?.message}
                className='rounded-lg'
              />

              <Input
                type="text"
                label="Username"
                placeholder="random_username"
                className='rounded-lg'
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters"
                  },
                  maxLength: {
                    value: 30,
                    message: "Username must be less than 20 characters"
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Username can only contain letters, numbers and underscores"
                  }
                })}
                error={errors.username?.message}
              />

              <div className="relative">
                <Input
                  type={passwordType}
                  label="Password"
                  placeholder="••••••••"
                  className="pr-10 rounded-lg"
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => {
                      if (value.length < 8) return "At least 8 characters";
                      if (value.length > 20) return "Maximum 20 characters";
                      if (!/[A-Za-z]/.test(value)) return "Must include a letter";
                      if (!/\d/.test(value)) return "Must include a number";
                      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Must include a special character";
                      return true;
                    }
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className={`absolute right-3 top-[38px] p-1 rounded-md focus:outline-none text-gray-400 hover:text-gray-600`}
                  onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
                  aria-label={passwordType === 'password' ? 'Show password' : 'Hide password'}
                >
                  {passwordType !== 'password' ? (
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

              <div className="text-xs text-gray-600 dark:text-[#F2F4F7]">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>8-20 characters</li>
                  <li>At least one letter and number</li>
                  <li>At least one special characters required</li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <Input
                type="tel"
                inputMode="numeric"
                label="Phone Number"
                placeholder="9800000000"
                className="w-full rounded-lg"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid phone number (10 digits required)"
                  }
                })}
                error={errors.phone?.message}
              />

              <Select
                options={["Male", "Female", "Other"]}
                label="Gender"
                className="w-full"
                error={errors.gender?.message}
                {...register("gender", { required: "Gender is required" })}
              />

              <Select
                options={["Student", "Teacher"]}
                label="Role"
                className="w-full"
                error={errors.role?.message}
                {...register("role", { required: "Role is required" })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#F2F4F7]">
                  Profile Picture <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                </label>
                <div className="mt-1 flex items-center">
                  <label className="flex flex-col items-center px-4 py-2 rounded-lg border border-dashed cursor-pointer hover:bg-gray-50 transition-colors border-gray-300">
                    <svg className="h-8 w-8 mb-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-center text-gray-500">
                      {watch('profilePicture')  // solve the issue

                        ? watch('profilePicture')?.[0]?.name
                        : 'Click to upload (JPG, PNG)'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      {...register("profilePicture")}
                      accept="image/jpeg,image/png"
                    />
                  </label>
                </div>
                {errors.profilePicture && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.profilePicture.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded focus:ring-0 focus:ring-offset-0 checked:bg-[#6C48E3] checked:border-[#6C48E3] dark:checked:bg-[#6C48E3] dark:checked:border-[#6C48E3]"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-[#F2F4F7]" >
              I agree to the <a href="#" className="font-medium text-[#6C48E3]">Terms of Service</a> and <a href="#" className="font-medium text-[#6C48E3]">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-[#6C48E3] hover:text-white bg-white border border-[#6C48E3] dark:bg-[#F2F4F7] dark:hover:bg-[#6C48E3] dark:text-[#6C48E3] dark:hover:text-[#F2F4F7] text-gray-600`}

          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-[#F2F4F7]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-[#6C48E3]" >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="animate-spin ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
  );
}