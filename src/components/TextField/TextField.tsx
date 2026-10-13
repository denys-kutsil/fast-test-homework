import React from "react";

interface TextFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange(value: string): void;
}

export const TextField = (props: TextFieldProps) => (
  <label className="text-field">
    <span className="text-field__label">{props.label}</span>
    <input
      type="text"
      value={props.value}
      disabled={props.disabled}
      onChange={(event) => props.onChange(event.target.value)}
    />
  </label>
);
