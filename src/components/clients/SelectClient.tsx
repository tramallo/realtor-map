import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mui/material";

import { Client } from "../../utils/data-schema";
import { ListPersons } from "./ListClients";
import SearchClients from "./SearchClients";

export interface SelectClientProps {
  onSelect: (selected: Array<Client["id"]>) => void;
  defaultSelected?: Array<Client["id"]>;
  multiselect?: boolean;
}

export function SelectClient({
  onSelect,
  defaultSelected,
  multiselect,
}: SelectClientProps) {
  const { t } = useTranslation();

  const [searchResult, setSearchResult] = useState([] as Array<Client["id"]>);
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
        clientIds={searchResult}
        selected={selected}
        onSelect={setSelected}
        multiselect={multiselect}
        height="100%"
      />
      <Stack spacing={1}>
        <SearchClients onSearch={setSearchResult} />
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
