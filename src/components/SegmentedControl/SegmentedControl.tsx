import React from "react";

import { SegmentedControlProps } from "./SegmentedControl.types";

// Radio inputs rather than buttons: the browser enforces that exactly one
// option is picked, so the component never has to work it out itself.
export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control">
      {props.options.map((option) => (
        <label key={option.value} className="segmented-control__option">
          <input
            type="radio"
            name={props.name}
            value={option.value}
            checked={option.checked}
            onChange={() => props.onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
