
import React, { forwardRef, useId } from 'react';

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type = 'text', ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    return (
      <div className="w-full">
        {label && (
          <label className="inline-block mb-1 pl-1 text-gray-600 dark:text-[#F2F4F7]" htmlFor={id}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border ${
            error ? 'border-red-500' : 'border-gray-200'
          } w-full focus:outline-none focus:ring-2 focus:ring-[#6C48E3] ${className}`}
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default Input;