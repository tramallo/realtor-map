import { Button, Stack } from "@mui/material";
import { Person } from "../../utils/data-schema";
import { ListPersons } from "./ListPersons";
import SearchPersons from "./SearchPersons";
import { useState } from "react";

export interface SelectPersonProps {
  onSelect: (selected: Array<Person["id"]>) => void;
  defaultSelected?: Array<Person["id"]>;
  multiselect?: boolean;
}

export function SelectPerson({
  onSelect,
  defaultSelected,
  multiselect,
}: SelectPersonProps) {
  const [searchResult, setSearchResult] = useState([] as Array<Person["id"]>);
  const [selected, setSelected] = useState(defaultSelected ?? []);

  return (
    <Stack
      boxSizing="border-box"
      spacing={1}
      padding={1}
      justifyContent="space-between"
      height="100%"
    >
      <ListPersons
        personIds={searchResult}
        selected={selected}
        onSelect={setSelected}
        multiselect={multiselect}
        height="100%"
      />
      <Stack spacing={1}>
        <SearchPersons onSearch={setSearchResult} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={2}
        >
          <Button variant="contained" onClick={() => onSelect(selected)}>
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
