import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";

import { Person } from "../utils/data-schema";
import { ListPersons } from "../components/persons/ListPersons";
import SearchPersons from "../components/persons/SearchPersons";
import CustomModal from "../components/CustomModal";
import CreatePerson from "../components/persons/CreatePerson";

export function PersonsLayout() {
  const [searchResults, setSearchResults] = useState([] as Array<Person["id"]>);
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false);

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
          <ListPersons personIds={searchResults} />
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchPersons onSearch={setSearchResults} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={1}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreatePersonModalOpen(true)}
          >
            New person
          </Button>
        </Stack>
        <CustomModal
          title="New person"
          open={createPersonModalOpen}
          onClose={() => setCreatePersonModalOpen(false)}
        >
          <CreatePerson />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
