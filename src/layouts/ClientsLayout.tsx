import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";

import { Client } from "../utils/data-schema";
import { ListPersons } from "../components/clients/ListClients";
import SearchClients from "../components/clients/SearchClients";
import CustomModal from "../components/CustomModal";
import CreateClient from "../components/clients/CreateClient";

export function ClientsLayout() {
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
          <ListPersons clientIds={searchResults} />
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
            New client
          </Button>
        </Stack>
        <CustomModal
          title="New client"
          open={createClientModalOpen}
          onClose={() => setCreateClientModalOpen(false)}
        >
          <CreateClient />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
