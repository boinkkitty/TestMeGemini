type SearchBarProps = {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
};

function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
    return (
        <input
            type="text"
            className="px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition w-full max-w-xs"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
}

export default SearchBar;
