
import React, { forwardRef, useId } from 'react';

type SelectProps = {
  options?: string[];
  label?: string;
  className?: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options = [], label, className = '', error, ...props }, ref) => {
    const id = useId();
    return (
      <div className="w-full">
        {label && (
          <label className="inline-block mb-1 pl-1 text-gray-600 dark:text-[#F2F4F7]" htmlFor={id}>
            {label}
          </label>
        )}
        <select
          className={`px-3 py-2 rounded-lg bg-white dark:bg-[#F2F4F7] text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
          ref={ref}
          id={id}
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
