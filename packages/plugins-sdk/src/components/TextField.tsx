import React from 'react';
import { Input, Label } from '@medusajs/ui';

export interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id'> {
  /**
   * The label for the text field. Can be a string or a React node for more complex labels.
   */
  label?: string | React.ReactNode;
  /**
   * Optional ID for the input. If not provided, a random ID will be generated.
   */
  id?: string;
  /**
   * Whether the field is required. Adds a red asterisk to the label.
   */
  required?: boolean;
  /**
   * Error message to display below the input.
   */
  error?: string;
  /**
   * Help text to display below the input.
   */
  helperText?: string;
  /**
   * Additional CSS classes for the container.
   */
  containerClassName?: string;
  /**
   * Additional CSS classes for the label.
   */
  labelClassName?: string;
}

/**
 * TextField component that combines Input and Label from @medusajs/ui.
 * Supports both string and ReactNode labels for maximum flexibility.
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  required = false,
  error,
  helperText,
  containerClassName = '',
  labelClassName = '',
  className = '',
  ...inputProps
}) => {
  // Generate a unique ID if none provided
  const inputId = id || React.useMemo(() => `textfield-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className={`flex flex-col gap-y-2 ${containerClassName}`}>
      {label && (
        <Label htmlFor={inputId} className={`text-ui-fg-subtle ${labelClassName}`}>
          {label}
          {required && <span className="text-ui-fg-error ml-1">*</span>}
        </Label>
      )}
      <Input
        id={inputId}
        className={`${error ? 'border-ui-border-error' : ''} ${className}`}
        {...inputProps}
      />
      {error && (
        <span className="text-ui-fg-error text-sm">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-ui-fg-muted text-sm">{helperText}</span>
      )}
    </div>
  );
};

export default TextField;

