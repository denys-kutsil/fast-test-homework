export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  checked: boolean;
}

export interface SegmentedControlProps<T extends string> {
  name: string;
  options: Array<SegmentedOption<T>>;
  onChange(value: T): void;
}
