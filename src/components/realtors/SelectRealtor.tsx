import { Button, Stack } from "@mui/material";
import { Realtor } from "../../utils/data-schema";
import { ListRealtors } from "./ListRealtors";
import SearchRealtors from "./SearchRealtors";
import { useState } from "react";

export interface SelectRealtorProps {
  onSelect: (selected: Array<Realtor["id"]>) => void;
  defaultSelected?: Array<Realtor["id"]>;
  multiselect?: boolean;
}

export function SelectRealtor({
  onSelect,
  defaultSelected,
  multiselect,
}: SelectRealtorProps) {
  const [searchResult, setSearchResult] = useState([] as Array<Realtor["id"]>);
  const [selected, setSelected] = useState(defaultSelected ?? []);

  return (
    <Stack
      boxSizing="border-box"
      spacing={1}
      padding={1}
      justifyContent="space-between"
      height="100%"
    >
      <ListRealtors
        realtorIds={searchResult}
        selected={selected}
        onSelect={setSelected}
        multiselect={multiselect}
        height="100%"
      />
      <Stack spacing={1}>
        <SearchRealtors onSearch={setSearchResult} />
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
