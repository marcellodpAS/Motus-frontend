import { TextInput, type TextInputProps } from "@/components/atoms/TextInput";

export interface SearchControlProps extends Omit<
  TextInputProps,
  "label" | "error"
> {
  value: string;
  onChangeText: (text: string) => void;
}

/** TextInput specialised for live search/filter fields — no label/error slots, `returnKeyType="search"`. */
export function SearchControl({
  value,
  onChangeText,
  placeholder = "Cerca",
  accessibilityLabel = "Cerca",
  ...props
}: SearchControlProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
      {...props}
    />
  );
}
