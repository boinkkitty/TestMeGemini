'use client';

type DropDownSelectionProps = {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

function DropDownSelection({ label, value, options, onChange }: DropDownSelectionProps) {
    return (
        <div className="flex items-center gap-4 min-w-[180px]">
            <label className="font-semibold text-gray-700 mb-1 pl-1">{label}</label>
            <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-gray-800"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default DropDownSelection;