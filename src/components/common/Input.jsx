import React from 'react';

const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  autoComplete,
  className = '',
  rightElement,
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="text-xs font-semibold text-gray-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full px-3.5 py-3 rounded-lg border text-sm text-[#0F1419] bg-white transition-all outline-none
            placeholder:text-gray-400
            ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-[#CFD9DE] focus:border-[#1D9BF0] focus:ring-2 focus:ring-sky-100'}
            ${rightElement ? 'pr-10' : ''}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600">
            {rightElement}
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default Input;

