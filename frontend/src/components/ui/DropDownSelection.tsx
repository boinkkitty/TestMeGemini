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
  label?: string;
  options: DropDownOption[];
  value: any;
  onChange: (value: string) => void;
  showBlankOption?: boolean;
};

type DropDownOption = {
  value: any;
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
    <div className="flex items-center gap-2 min-w-[180px]">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
          {label}
        </label>
      )}
      <Select value={value === "" ? "null" : value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] text-sm">
          <SelectValue placeholder={showBlankOption ? "Select" : options[0]?.label || "Select"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {showBlankOption && (
              <SelectItem value="null">All {label}</SelectItem>
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
