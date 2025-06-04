import { useEffect, useState } from "react";
import { Chip, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Contract } from "../utils/data-schema";
import ViewContract from "./contracts/ViewContract";
import { OperationResponse } from "../utils/helperFunctions";
import CustomModal from "./CustomModal";
import { selectContractById, useContractStore } from "../stores/contractsStore";

export interface ContractChipProps {
  contractId: Contract["id"];
  onClose?: () => void;
}

export default function ContractChip({
  contractId,
  onClose,
}: ContractChipProps) {
  const { t } = useTranslation();
  const fetchContract = useContractStore((store) => store.fetchContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewContractModalOpen, setViewContractModalOpen] = useState(false);

  const cachedContract = useContractStore(selectContractById(contractId));

  // fetchContract effect
  useEffect(() => {
    console.log(`ContractChip -> effect [fetchContract]`);

    setFetchContractResponse(undefined);
    setFetchingContract(true);
    fetchContract(contractId)
      .then(setFetchContractResponse)
      .finally(() => setFetchingContract(false));
  }, [contractId, fetchContract]);

  return (
    <>
      <Chip
        icon={fetchingContract ? <CircularProgress size="1ch" /> : undefined}
        label={
          !fetchContractResponse
            ? ""
            : fetchContractResponse.error
            ? "Error"
            : cachedContract
            ? `${cachedContract.property}:${cachedContract.client}`
            : t("errorMessages.contractNotFound")
        }
        color={
          !fetchContractResponse
            ? "info"
            : fetchContractResponse.error
            ? "error"
            : cachedContract
            ? "success"
            : "warning"
        }
        onClick={() => setViewContractModalOpen(true)}
        onDelete={
          onClose ? (!fetchingContract ? onClose : undefined) : undefined
        }
        size="small"
      />
      <CustomModal
        title={t("titles.viewContract")}
        open={viewContractModalOpen}
        onClose={() => setViewContractModalOpen(false)}
      >
        <ViewContract contractId={contractId} />
      </CustomModal>
    </>
  );
}
