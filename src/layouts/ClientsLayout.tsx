import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Client } from "../utils/data-schema";
import { ListPersons } from "../components/clients/ListClients";
import SearchClients from "../components/clients/SearchClients";
import CustomModal from "../components/CustomModal";
import CreateClient from "../components/clients/CreateClient";
import {
  selectSearchResultsBySearchIndex,
  useClientStore,
} from "../stores/clientsStore";

export function ClientsLayout() {
  const { t } = useTranslation();

  const [createClientModalOpen, setCreateClientModalOpen] = useState(false);

  const [searchIndex, setSearchIndex] = useState("");
  const [listRecordsPerPage] = useState(3);
  const [listPaginationId, setListPaginationId] = useState(
    undefined as Client["id"] | undefined
  );

  const searchResult = useClientStore(
    selectSearchResultsBySearchIndex(searchIndex)
  );
  const lastClientId = useMemo(
    () => (searchResult ?? []).at(-1),
    [searchResult]
  );

  const loadMoreClients = useCallback(() => {
    if (!lastClientId) {
      return;
    }

    setListPaginationId(lastClientId);
  }, [lastClientId]);

  const onClientsSearch = useCallback((newSearchIndex: string) => {
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
          <ListPersons
            clientIds={searchResult}
            onReachScrollEnd={loadMoreClients}
          />
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchClients
          onSearch={onClientsSearch}
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
            onClick={() => setCreateClientModalOpen(true)}
          >
            {t("buttons.newClientButton.label")}
          </Button>
        </Stack>
        <CustomModal
          title={t("titles.newClient")}
          open={createClientModalOpen}
          onClose={() => setCreateClientModalOpen(false)}
        >
          <CreateClient />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
