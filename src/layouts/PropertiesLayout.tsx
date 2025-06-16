import { useCallback, useMemo, useState } from "react";
import { Box, Button, Chip, Stack } from "@mui/material";
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
  selectSearchResultBySearchReference,
  usePropertyStore,
} from "../stores/propertiesStore";
import { SearchIndex } from "../utils/helperFunctions";

type PropertiesView = "list" | "map";
const MAP_VIEW_RECORDS_PER_PAGE = 100000;

export function PropertiesLayout() {
  const { t } = useTranslation();
  const fetchSearchPropertiesCount = usePropertyStore(
    (store) => store.fetchSearchPropertiesCount
  );

  const [view, setView] = useState("list" as PropertiesView);
  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);

  const [searchReference, setSearchReference] = useState(
    undefined as SearchIndex | undefined
  );
  const [listRecordsPerPage] = useState(3);
  const [listPaginationId, setListPaginationId] = useState(
    undefined as Property["id"] | undefined
  );
  const [mapRecordsPerPage] = useState(MAP_VIEW_RECORDS_PER_PAGE);
  const [mapPaginationId] = useState(undefined as Property["id"] | undefined);

  const searchResult = usePropertyStore(
    selectSearchResultBySearchReference(searchReference)
  );

  const lastPropertyId = useMemo(
    () => (searchResult?.dataIds ?? []).at(-1),
    [searchResult?.dataIds]
  );

  console.log(`PropertiesLayout -> render -
    searchReference: ${searchReference}
    lastPropertyId: ${lastPropertyId}
    listPaginationId: ${listPaginationId}`);

  const loadMoreProperties = useCallback(() => {
    if (!lastPropertyId) {
      return;
    }
    console.log(`PropertiesLayout -> loadMoreProperties`);

    setListPaginationId(lastPropertyId);
  }, [lastPropertyId]);

  const loadSearchPropertiesCount = useCallback(() => {
    if (
      !searchReference ||
      !searchResult ||
      searchResult.totalRows != undefined
    ) {
      return;
    }
    console.log(`PropertiesLayout -> loadSearchPropertiesCount`);

    fetchSearchPropertiesCount(searchReference);
  }, [searchResult, searchReference, fetchSearchPropertiesCount]);

  const onPropertiesSearch = useCallback((newSearchReference: string) => {
    setSearchReference(newSearchReference);
  }, []);

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
            <MapProperties propertyIds={searchResult?.dataIds} height="100%" />
          ) : (
            <ListProperties
              propertyIds={searchResult?.dataIds}
              onReachScrollEnd={loadMoreProperties}
            />
          )}
        </Box>
      </Stack>
      <Stack spacing={1} minHeight="auto">
        <Chip
          label={`Showing ${searchResult?.dataIds.length ?? 0}/${
            searchResult?.totalRows ?? "??"
          } items`}
          variant="filled"
          color="info"
          size="small"
          onClick={loadSearchPropertiesCount}
        />
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
