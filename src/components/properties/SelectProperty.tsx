import { useState } from "react";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Property } from "../../utils/data-schema";
import { ListProperties } from "./ListProperties";
import SearchProperties from "./SearchProperties";

export interface SelectPropertyProps {
  onSelect: (selected: Array<Property["id"]>) => void;
  defaultSelected?: Array<Property["id"]>;
  multiselect?: boolean;
}

export function SelectProperty({
  onSelect,
  defaultSelected,
  multiselect,
}: SelectPropertyProps) {
  const { t } = useTranslation();

  const [searchResult, setSearchResult] = useState([] as Array<Property["id"]>);
  const [selected, setSelected] = useState(defaultSelected ?? []);

  return (
    <Stack
      boxSizing="border-box"
      spacing={1}
      padding={1}
      justifyContent="space-between"
      height="100%"
    >
      <ListProperties
        propertyIds={searchResult}
        selected={selected}
        onSelect={setSelected}
        multiselect={multiselect}
        height="100%"
      />
      <Stack spacing={1}>
        <SearchProperties onSearch={setSearchResult} />
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
