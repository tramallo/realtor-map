import { useState } from "react";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Realtor } from "../../utils/data-schema";
import { ListRealtors } from "./ListRealtors";
import SearchRealtors from "./SearchRealtors";

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
  const { t } = useTranslation();

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
            {t("buttons.confirmButton.label")}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
