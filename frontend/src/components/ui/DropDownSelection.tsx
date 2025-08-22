'use client';

type DropDownSelectionProps = {
    label: string;
    options: { value: string, label: string}[];
    value: string;
    onChange: (value: string) => void;
}

function DropDownSelection({label, value, options, onChange}: DropDownSelectionProps) {
    return (
       <div className="flex gap-1">
           <label className="font-medium text-gray-700">{label}</label>
           <select
               className="border rounded px-3 py-2"
               value={value}
               onChange={e => onChange(e.target.value)}
           >
               {options.map((option) => (
                   <option key={option.value} value={option.value}>
                       {option.label}
                   </option>
               ))}
           </select>
       </div>
    )
}