// Reusable Input component
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label" htmlFor={props.id}>
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
        {helperText && !error && (
          <span className="helper-text">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
