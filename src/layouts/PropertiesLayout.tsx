import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { useTranslation } from "react-i18next";

import SearchProperties from "../components/properties/SearchProperties";
import { ListProperties } from "../components/properties/ListProperties";
import MapProperties from "../components/properties/MapProperties";
import CustomModal from "../components/CustomModal";
import CreateProperty from "../components/properties/CreateProperty";
import { Property } from "../utils/data-schema";
import {
  selectSearchResultsBySearchIndex,
  usePropertyStore,
} from "../stores/propertiesStore";

const MAP_VIEW_RECORDS_PER_PAGE = 100000;

export function PropertiesLayout() {
  const { t } = useTranslation();

  const [view, setView] = useState("list" as "list" | "map");
  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);

  const [searchIndex, setSearchIndex] = useState("");
  const [listRecordsPerPage] = useState(3);
  const [listPaginationId, setListPaginationId] = useState(
    undefined as Property["id"] | undefined
  );
  const [mapRecordsPerPage] = useState(MAP_VIEW_RECORDS_PER_PAGE);
  const [mapPaginationId] = useState(undefined as Property["id"] | undefined);

  const searchResult = usePropertyStore(
    selectSearchResultsBySearchIndex(searchIndex)
  );
  const lastPropertyId = useMemo(
    () => (searchResult ?? []).at(-1),
    [searchResult]
  );

  const loadMoreProperties = useCallback(() => {
    if (!lastPropertyId) {
      return;
    }

    setListPaginationId(lastPropertyId);
  }, [lastPropertyId]);

  const onPropertiesSearch = useCallback(
    (newSearchIndex: string) => {
      setSearchIndex(newSearchIndex);

      if (view == "list") {
        setListPaginationId(undefined);
      }
    },
    [view]
  );

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      height="100%"
      padding={1}
      boxSizing="border-box"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <Stack spacing={1} minHeight={0} flexGrow={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-around"
        >
          <Button
            variant="contained"
            color={view == "list" ? "secondary" : undefined}
            onClick={() => setView("list")}
          >
            <FormatListNumberedIcon />
          </Button>
          <Button
            variant="contained"
            color={view == "map" ? "secondary" : undefined}
            onClick={() => setView("map")}
          >
            <LocationOnIcon />
          </Button>
        </Stack>
        <Box overflow="auto" height="100%">
          {view == "map" ? (
            <MapProperties propertyIds={searchResult} height="100%" />
          ) : (
            <ListProperties
              propertyIds={searchResult}
              onReachScrollEnd={loadMoreProperties}
            />
          )}
        </Box>
      </Stack>
      <Stack spacing={1} minHeight="auto">
        <SearchProperties
          onSearch={onPropertiesSearch}
          recordsPerPage={
            view == "list" ? listRecordsPerPage : mapRecordsPerPage
          }
          paginationId={view == "list" ? listPaginationId : mapPaginationId}
        />
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
            {t("buttons.newPropertyButton.label")}
          </Button>
        </Stack>
        <CustomModal
          title={t("titles.newProperty")}
          open={createPropertyModalOpen}
          onClose={() => setCreatePropertyModalOpen(false)}
        >
          <CreateProperty />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
