import { useState } from "react";
import { Button, Stack } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";

import { Property } from "../utils/data-schema";
import SearchProperties from "../components/properties/SearchProperties";
import { ListProperties } from "../components/properties/ListProperties";
import MapProperties from "../components/properties/MapProperties";
import CustomModal from "../components/CustomModal";
import CreateProperty from "../components/properties/CreateProperty";

export function PropertiesLayout() {
  const [view, setView] = useState("list" as "list" | "map");
  const [searchResults, setSearchResults] = useState(
    [] as Array<Property["id"]>
  );

  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      height="100%"
      padding={1}
      boxSizing="border-box"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <Stack spacing={1} height="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-around"
        >
          <Button variant="contained" onClick={() => setView("list")}>
            <FormatListNumberedIcon />
          </Button>
          <Button variant="contained" onClick={() => setView("map")}>
            <LocationOnIcon />
          </Button>
        </Stack>
        {view == "map" ? (
          <MapProperties propertyIds={searchResults} flexGrow={1} />
        ) : (
          <ListProperties propertyIds={searchResults} />
        )}
      </Stack>
      <Stack spacing={1}>
        <SearchProperties onSearch={setSearchResults} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={1}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreatePropertyModalOpen(true)}
          >
            New property
          </Button>
        </Stack>
        <CustomModal
          title="New property"
          open={createPropertyModalOpen}
          onClose={() => setCreatePropertyModalOpen(false)}
        >
          <CreateProperty />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
