type SearchBarProps = {
    placeholder: string;
    value: string;
    handleChange: (value: string) => void;
}

function SearchBar({placeholder, value, handleChange}: SearchBarProps) {
    return (
        <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            placeholder={placeholder}
            value={value}
            onChange={e => handleChange(e.target.value)}
        />
    )
}

export default SearchBar;