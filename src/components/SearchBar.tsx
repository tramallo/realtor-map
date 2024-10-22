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

  const fireSearchEvent = () => {
    if (!searchValue && !allowEmptySearch) {
      return;
    }

    onSearch(searchValue);
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != "Enter") {
      return;
    }

    fireSearchEvent();
  };

  return (
    <div className="search-pane">
      <label className="attribution">Search powered by Google</label>
      <div className="search-bar">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleInputEnter}
        />
        <button onClick={fireSearchEvent}>Search</button>
      </div>
    </div>
  );
}
