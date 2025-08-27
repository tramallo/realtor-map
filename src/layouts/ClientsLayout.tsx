import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Client } from "../utils/data-schema";
import { ListClients } from "../components/clients/ListClients";
import SearchClients from "../components/clients/SearchClients";
import CustomModal from "../components/CustomModal";
import CreateClient from "../components/clients/CreateClient";

export function ClientsLayout() {
  const { t } = useTranslation();

  const [searchResults, setSearchResults] = useState([] as Array<Client["id"]>);
  const [createClientModalOpen, setCreateClientModalOpen] = useState(false);

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
          <ListClients clientIds={searchResults} />
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchClients onSearch={setSearchResults} />
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
          <CreateClient onCreate={() => setCreateClientModalOpen(false)} />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
