import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";

import { Realtor } from "../utils/data-schema";
import { ListRealtors } from "../components/realtors/ListRealtors";
import SearchRealtors from "../components/realtors/SearchRealtors";
import CustomModal from "../components/CustomModal";
import CreateRealtor from "../components/realtors/CreateRealtor";

export function RealtorsLayout() {
  const [searchResults, setSearchResults] = useState(
    [] as Array<Realtor["id"]>
  );
  const [createRealtorModalOpen, setCreateRealtorModalOpen] = useState(false);

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
          <ListRealtors realtorIds={searchResults} />
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchRealtors onSearch={setSearchResults} />
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
            New realtor
          </Button>
        </Stack>
        <CustomModal
          title="New realtor"
          open={createRealtorModalOpen}
          onClose={() => setCreateRealtorModalOpen(false)}
        >
          <CreateRealtor />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
