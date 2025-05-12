import { useEffect, useState } from "react";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { Contract } from "../../utils/data-schema";
import {
  fetchByIdSelector,
  useContractStore,
} from "../../stores/contractsStore";
import {
  OperationResponse,
  timestampToDDMMYYString,
} from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewContract from "./ViewContract";
import PropertyChip from "../PropertyChip";
import PersonChip from "../PersonChip";

export interface CardContractProps {
  contractId: Contract["id"];
  onClick?: (contractId: Contract["id"]) => void;
  selected?: boolean;
}

export function CardContract({
  contractId,
  onClick,
  selected,
}: CardContractProps) {
  const fetchContract = useContractStore((store) => store.fetchContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewContractModalOpen, setViewContractModalOpen] = useState(false);

  const contract = useContractStore(fetchByIdSelector(contractId));

  // fetchContract effect
  useEffect(() => {
    setFetchingContract(true);
    fetchContract(contractId)
      .then(setFetchContractResponse)
      .finally(() => setFetchingContract(false));
  }, [contractId, fetchContract]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius={1}
      paddingInline={1}
      width="100%"
      border="1px solid black"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      onClick={onClick && contract ? () => onClick(contractId) : undefined}
    >
      {fetchingContract && (
        <CircularProgress size="1.4em" sx={{ padding: 1 }} />
      )}
      {!fetchingContract && !contract && (
        <Typography color="error" fontWeight="bold" sx={{ padding: 1 }}>
          {fetchContractResponse?.error
            ? fetchContractResponse?.error.message
            : "Contract not found"}
        </Typography>
      )}
      {!fetchingContract && contract && (
        <>
          <Stack direction="row" spacing={1}>
            {selected != undefined && (
              <Checkbox
                checked={selected}
                sx={{ minWidth: "1px", padding: 0 }}
              />
            )}
            <PropertyChip propertyId={contract.property} />
            <PersonChip personId={contract.client} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              color="textSecondary"
            >{`${timestampToDDMMYYString(
              contract.start
            )} -> ${timestampToDDMMYYString(contract.end)}`}</Typography>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setViewContractModalOpen(true);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>
          <CustomModal
            title={`View Contract: ${contractId}`}
            open={viewContractModalOpen}
            onClose={() => setViewContractModalOpen(false)}
          >
            <ViewContract contractId={contractId} />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
