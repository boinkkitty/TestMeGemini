type SearchBarProps = {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
    return (
        <input
            type="text"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-xs bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-gray-800"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
}

export default SearchBar;