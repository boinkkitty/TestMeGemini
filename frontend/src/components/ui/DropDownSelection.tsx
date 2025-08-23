'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DropDownSelectionProps = {
  label: string;
  options: DropDownOption[];
  value: string;
  onChange: (value: string) => void;
  showBlankOption?: boolean;
};

type DropDownOption = {
  value: string;
  label: string;
};

function DropDownSelection({ label, value, options, onChange, showBlankOption = true }: DropDownSelectionProps) {

  const handleValueChange = (val: string) => {
    if (val === "null") {
      onChange("");
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex items-center gap-4 min-w-[180px]">
      <label className="font-semibold text-gray-700 mb-1 pl-1">{label}</label>
      <Select value={value === "" ? "null" : value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={showBlankOption ? "Select" : options[0]?.label || "Select"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {showBlankOption && (
              <SelectItem value="null">Select {label}</SelectItem>
            )}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default DropDownSelection;