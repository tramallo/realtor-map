import { useState } from "react";

import SimpleSpinner from "./SimpleSpinner";
import { Button, FormGroup, IconButton, InputAdornment, TextField } from "@mui/material";

export interface SearchBarProps {
  onSearch: (searchValue: string) => Promise<void>;
  onClear?: () => void;
  label?: string | JSX.Element;
  allowEmptySearch?: boolean;
}
const defaults = {
  allowEmptySearch: false,
};

export default function SearchBar({
  onSearch,
  onClear,
  label,
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

  const clearSearch = () => {
    setSearchValue("");

    if (onClear) {
      onClear();
    }
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key != "Enter") {
      return;
    }

    fireSearchEvent();
  };

  return (
    <FormGroup row>
      <TextField
        variant="outlined"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleInputEnter}
        sx={{ flex: 9 }}
        label={label}
        slotProps={{ 
          input: { endAdornment: <InputAdornment position="end">
              <IconButton onClick={clearSearch}>x</IconButton></InputAdornment>
          },
          inputLabel: { shrink: true }
        }}
        disabled={isSearching}
      />
      <Button 
        variant="outlined" 
        sx={{ flex: 1 }}
        onClick={fireSearchEvent}
        disabled={isSearching}
      >
        { isSearching ? <SimpleSpinner /> : "Search" }
      </Button>
    </FormGroup>
  );
}
