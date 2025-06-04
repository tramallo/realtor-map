import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  useContractStore,
  selectContractById,
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
  const { t } = useTranslation();
  const fetchContract = useContractStore((store) => store.fetchContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deleteContractModalOpen, setDeleteContractModalOpen] = useState(false);
  const [updateContractModalOpen, setUpdateContractModalOpen] = useState(false);

  const cachedContract = useContractStore(selectContractById(contractId));

  // fetchContract effect
  useEffect(() => {
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
            : t("errorMessages.contractNotFound", { contractId: contractId })}
        </Typography>
      )}
      {!fetchingContract && cachedContract && (
        <>
          {cachedContract.deleted && (
            <Chip
              label={t("entities.base.deleted")}
              color="error"
              variant="outlined"
            />
          )}
          <PropertyField
            label={t("entities.contract.property")}
            selected={[cachedContract.property]}
            onSelect={() => undefined}
          />
          <ClientField
            label={t("entities.contract.client")}
            selected={[cachedContract.client]}
            onSelect={() => undefined}
          />
          <DateField
            label={t("entities.contract.start")}
            value={cachedContract.start}
            readOnly
          />
          <DateField
            label={t("entities.contract.end")}
            value={cachedContract.end}
            readOnly
          />
          {cachedContract.description && (
            <CustomTextField
              value={cachedContract.description}
              label={t("entities.contract.description")}
              multiline
            />
          )}
          {cachedContract.createdBy && (
            <CustomTextField
              label={t("entities.base.createdBy")}
              value={cachedContract.createdBy}
            />
          )}
          {cachedContract.createdAt && (
            <DateField
              label={t("entities.base.createdAt")}
              value={cachedContract.createdAt}
            />
          )}
          {cachedContract.updatedBy && (
            <CustomTextField
              label={t("entities.base.updatedBy")}
              value={cachedContract.updatedBy}
            />
          )}
          {cachedContract.updatedAt && (
            <DateField
              label={t("entities.base.updatedAt")}
              value={cachedContract.updatedAt}
            />
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
              {cachedContract.deleted
                ? t("buttons.restoreButton.label")
                : t("buttons.deleteButton.label")}
            </Button>
            {!cachedContract.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateContractModalOpen(true)}
              >
                {t("buttons.updateButton.label")}
              </Button>
            )}
          </Stack>
          <CustomModal
            title={
              cachedContract.deleted
                ? t("titles.restoreContract")
                : t("titles.deleteContract")
            }
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
            title={t("titles.updateContract")}
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
