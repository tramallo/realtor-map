import { Chip, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Property } from "../utils/data-schema";
import ViewProperty from "./properties/ViewProperty";
import { OperationResponse } from "../utils/helperFunctions";
import CustomModal from "./CustomModal";
import { fetchByIdSelector, usePropertyStore } from "../stores/propertiesStore";

export interface PropertyChipProps {
  propertyId: Property["id"];
  onClose?: () => void;
}

export default function PropertyChip({
  propertyId,
  onClose,
}: PropertyChipProps) {
  const { t } = useTranslation();
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPropertyModalOpen, setViewPropertyModalOpen] = useState(false);

  const cachedProperty = usePropertyStore(fetchByIdSelector(propertyId));

  // fetchProperty effect
  useEffect(() => {
    console.log(`PropertyChip -> effect [fetchProperty]`);

    setFetchPropertyResponse(undefined);
    setFetchingProperty(true);
    fetchProperty(propertyId)
      .then(setFetchPropertyResponse)
      .finally(() => setFetchingProperty(false));
  }, [propertyId, fetchProperty]);

  return (
    <>
      <Chip
        icon={fetchingProperty ? <CircularProgress size="1ch" /> : undefined}
        label={
          !fetchPropertyResponse
            ? ""
            : fetchPropertyResponse.error
            ? "Error"
            : cachedProperty
            ? cachedProperty.address
            : t("errorMessages.propertyNotFound")
        }
        color={
          !fetchPropertyResponse
            ? "info"
            : fetchPropertyResponse.error
            ? "error"
            : cachedProperty
            ? "success"
            : "warning"
        }
        onClick={() => setViewPropertyModalOpen(true)}
        onDelete={
          onClose ? (!fetchingProperty ? onClose : undefined) : undefined
        }
        size="small"
      />
      <CustomModal
        title={t("titles.viewProperty")}
        open={viewPropertyModalOpen}
        onClose={() => setViewPropertyModalOpen(false)}
      >
        <ViewProperty propertyId={propertyId} />
      </CustomModal>
    </>
  );
}
