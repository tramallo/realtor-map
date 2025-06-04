import { useCallback, useMemo, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { Contract } from "../utils/data-schema";
import SearchContracts from "../components/contracts/SearchContracts";
import { ListContracts } from "../components/contracts/ListContracts";
import CustomModal from "../components/CustomModal";
import CreateContract from "../components/contracts/CreateContract";
import { CalendarContracts } from "../components/contracts/CalendarContracts";
import { useTranslation } from "react-i18next";
import {
  selectSearchResultsBySearchIndex,
  useContractStore,
} from "../stores/contractsStore";

const CALENDAR_VIEW_RECORDS_PER_PAGE = 100000;

export function ContractsLayout() {
  const { t } = useTranslation();

  const [view, setView] = useState("list" as "list" | "calendar");
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

  const [searchIndex, setSearchIndex] = useState("");
  const [listRecordsPerPage] = useState(3);
  const [listPaginationId, setListPaginationId] = useState(
    undefined as Contract["id"] | undefined
  );
  const [calendarRecordsPerPage] = useState(CALENDAR_VIEW_RECORDS_PER_PAGE);
  const [calendarPaginationId] = useState(
    undefined as Contract["id"] | undefined
  );

  const searchResult = useContractStore(
    selectSearchResultsBySearchIndex(searchIndex)
  );
  const lastContractId = useMemo(
    () => (searchResult ?? []).at(-1),
    [searchResult]
  );

  const loadMoreContracts = useCallback(() => {
    if (!lastContractId) {
      return;
    }

    setListPaginationId(lastContractId);
  }, [lastContractId]);

  const onContractsSearch = useCallback(
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
      <Stack spacing={1} minHeight={0}>
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
            color={view == "calendar" ? "secondary" : undefined}
            onClick={() => setView("calendar")}
          >
            <CalendarMonthIcon />
          </Button>
        </Stack>
        <Box overflow="auto">
          {view == "list" ? (
            <ListContracts
              contractIds={searchResult}
              onReachScrollEnd={loadMoreContracts}
            />
          ) : (
            <CalendarContracts contractIds={searchResult} />
          )}
        </Box>
      </Stack>
      <Stack spacing={1} minHeight={"auto"}>
        <SearchContracts
          onSearch={onContractsSearch}
          recordsPerPage={
            view == "list" ? listRecordsPerPage : calendarRecordsPerPage
          }
          paginationId={
            view == "list" ? listPaginationId : calendarPaginationId
          }
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
            onClick={() => setCreateContractModalOpen(true)}
          >
            {t("buttons.newContractButton.label")}
          </Button>
        </Stack>
        <CustomModal
          title={t("titles.newContract")}
          open={createContractModalOpen}
          onClose={() => setCreateContractModalOpen(false)}
        >
          <CreateContract />
        </CustomModal>
      </Stack>
    </Stack>
  );
}
