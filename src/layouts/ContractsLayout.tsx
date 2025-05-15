import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { Contract } from "../utils/data-schema";
import SearchContracts from "../components/contracts/SearchContracts";
import { ListContracts } from "../components/contracts/ListContracts";
import CustomModal from "../components/CustomModal";
import CreateContract from "../components/contracts/CreateContract";
import { CalendarContracts } from "../components/contracts/CalendarContracts";

export function ContractsLayout() {
  const [view, setView] = useState("list" as "list" | "calendar");
  const [searchResults, setSearchResults] = useState(
    [] as Array<Contract["id"]>
  );
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-around"
        >
          <Button variant="contained" onClick={() => setView("list")}>
            <FormatListNumberedIcon />
          </Button>
          <Button variant="contained" onClick={() => setView("calendar")}>
            <CalendarMonthIcon />
          </Button>
        </Stack>
        <Box overflow="auto">
          {view == "list" ? (
            <ListContracts contractIds={searchResults} />
          ) : (
            <CalendarContracts contractIds={searchResults} />
          )}
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchContracts onSearch={setSearchResults} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={1}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreateContractModalOpen(true)}
          >
            New Contract
          </Button>
        </Stack>
        <CustomModal
          title="New Contract"
          open={createContractModalOpen}
          onClose={() => setCreateContractModalOpen(false)}
        >
          <CreateContract />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
