import { useState } from "react";

import "./SearchBar.css";
import SimpleSpinner from "./SimpleSpinner";

export interface SearchBarProps {
  onSearch: (searchValue: string) => Promise<void>;
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
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputField = e.target;
    setSearchValue(inputField.value);
  };

  const fireSearchEvent = () => {
    if (!searchValue && !allowEmptySearch) {
      return;
    }

    setIsSearching(true);
    onSearch(searchValue).finally(() => setIsSearching(false));
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != "Enter") {
      return;
    }

    fireSearchEvent();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleInputEnter}
      />
      <button onClick={fireSearchEvent}>
        {isSearching ? <SimpleSpinner /> : "Search"}
      </button>
    </div>
  );
}
