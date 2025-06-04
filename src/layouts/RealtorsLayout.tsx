import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { ListRealtors } from "../components/realtors/ListRealtors";
import SearchRealtors from "../components/realtors/SearchRealtors";
import CustomModal from "../components/CustomModal";
import CreateRealtor from "../components/realtors/CreateRealtor";
import { useRealtorStore } from "../stores/realtorsStore";
import { selectSearchResultsBySearchIndex } from "../stores/realtorsStore";
import { Realtor } from "../utils/data-schema";

export function RealtorsLayout() {
  const { t } = useTranslation();

  const [createRealtorModalOpen, setCreateRealtorModalOpen] = useState(false);

  const [searchIndex, setSearchIndex] = useState("");
  const [listRecordsPerPage] = useState(3);
  const [listPaginationId, setListPaginationId] = useState(
    undefined as Realtor["id"] | undefined
  );

  const searchResult = useRealtorStore(
    selectSearchResultsBySearchIndex(searchIndex)
  );
  const lastRealtorId = useMemo(
    () => (searchResult ?? []).at(-1),
    [searchResult]
  );

  const loadMoreRealtors = useCallback(() => {
    if (!lastRealtorId) {
      return;
    }

    setListPaginationId(lastRealtorId);
  }, [lastRealtorId]);

  const onRealtorsSearch = useCallback((newSearchIndex: string) => {
    setSearchIndex(newSearchIndex);
    setListPaginationId(undefined);
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
      <Stack spacing={1} minHeight={0}>
        <Box overflow="auto">
          <ListRealtors
            realtorIds={searchResult}
            onReachScrollEnd={loadMoreRealtors}
          />
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchRealtors
          onSearch={onRealtorsSearch}
          recordsPerPage={listRecordsPerPage}
          paginationId={listPaginationId}
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
            onClick={() => setCreateRealtorModalOpen(true)}
          >
            {t("buttons.newRealtorButton.label")}
          </Button>
        </Stack>
        <CustomModal
          title={t("titles.newRealtor")}
          open={createRealtorModalOpen}
          onClose={() => setCreateRealtorModalOpen(false)}
        >
          <CreateRealtor />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
