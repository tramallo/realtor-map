import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  useContractStore,
  fetchByIdSelector,
} from "../../stores/contractsStore";
import { Contract } from "../../utils/data-schema";
import DeleteContract from "./DeleteContract";
import UpdateContract from "./UpdateContract";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";
import PropertyField from "../PropretyField";
import ClientField from "../ClientField";
import DateField from "../DateField";

export interface ViewContractProps {
  contractId: Contract["id"];
}

export default function ViewContract({ contractId }: ViewContractProps) {
  const fetchContract = useContractStore((store) => store.fetchContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deleteContractModalOpen, setDeleteContractModalOpen] = useState(false);
  const [updateContractModalOpen, setUpdateContractModalOpen] = useState(false);

  const cachedContract = useContractStore(fetchByIdSelector(contractId));

  // fetchContract effect
  useEffect(() => {
    console.log(`ViewContract -> effect [fetchContract]`);

    setFetchContractResponse(undefined);
    setFetchingContract(true);
    fetchContract(contractId)
      .then(setFetchContractResponse)
      .finally(() => setFetchingContract(false));
  }, [contractId, fetchContract]);

  return (
    <Stack spacing={2} padding={1}>
      {fetchingContract && (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      {!fetchingContract && !cachedContract && (
        <Typography
          variant="h6"
          align="center"
          color={fetchContractResponse?.error ? "error" : "warning"}
        >
          {fetchContractResponse?.error
            ? fetchContractResponse.error.message
            : `Contract (id: ${contractId}) not found`}
        </Typography>
      )}
      {!fetchingContract && cachedContract && (
        <>
          {cachedContract.deleted && (
            <Chip label="Deleted" color="error" variant="outlined" />
          )}

          <PropertyField
            label="Property"
            selected={[cachedContract.property]}
            onSelect={() => undefined}
          />
          <ClientField
            label="Client"
            selected={[cachedContract.client]}
            onSelect={() => undefined}
          />
          <DateField label="Start" value={cachedContract.start} readOnly />
          <DateField label="End" value={cachedContract.end} readOnly />

          {cachedContract.description && (
            <CustomTextField
              value={cachedContract.description}
              label="Description"
              multiline
            />
          )}
          {cachedContract.createdBy && (
            <CustomTextField
              label="Created by"
              value={cachedContract.createdBy}
            />
          )}
          {cachedContract.createdAt && (
            <DateField label="Created at" value={cachedContract.createdAt} />
          )}
          {cachedContract.updatedBy && (
            <CustomTextField
              label="Updated by"
              value={cachedContract.updatedBy}
            />
          )}
          {cachedContract.updatedAt && (
            <DateField label="Updated at" value={cachedContract.updatedAt} />
          )}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <Button
              variant="contained"
              color={cachedContract.deleted ? "success" : "error"}
              onClick={() => setDeleteContractModalOpen(true)}
            >
              {cachedContract.deleted ? "Restore" : "Delete"}
            </Button>
            {!cachedContract.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateContractModalOpen(true)}
              >
                Update
              </Button>
            )}
          </Stack>
          <CustomModal
            title={`Delete Contract: ${contractId}`}
            open={deleteContractModalOpen}
            onClose={() => setDeleteContractModalOpen(false)}
          >
            <DeleteContract
              contractId={contractId}
              onSoftDelete={() => setDeleteContractModalOpen(false)}
              onRestore={() => setDeleteContractModalOpen(false)}
            />
          </CustomModal>
          <CustomModal
            title={`Update Contract: ${contractId}`}
            open={updateContractModalOpen}
            onClose={() => setUpdateContractModalOpen(false)}
          >
            <UpdateContract
              contractId={contractId}
              onUpdate={() => setUpdateContractModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
