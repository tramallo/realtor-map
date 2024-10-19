import { useState } from "react";

import "./SearchBar.css";

export interface SearchBarProps {
  onSearch: (searchValue: string) => void;
  allowEmptySearch?: boolean;
}
const defaults = {
  allowEmptySearch: false,
};

export default function SearchBar({
  onSearch,
  allowEmptySearch = defaults.allowEmptySearch,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputField = e.target;
    setSearchValue(inputField.value);
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != "Enter") {
      return;
    }

    if (!searchValue && !allowEmptySearch) {
      return;
    }

    onSearch(searchValue);
  };

  return (
    <input
      className="search-bar"
      type="text"
      value={searchValue}
      onChange={handleInputChange}
      onKeyDown={handleInputEnter}
    />
  );
}
