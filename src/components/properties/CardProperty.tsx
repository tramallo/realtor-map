import { useEffect, useState } from "react";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";

import { Property } from "../../utils/data-schema";
import {
  fetchByIdSelector,
  usePropertyStore,
} from "../../stores/propertiesStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewProperty from "./ViewProperty";

export interface CardPropertyProps {
  propertyId: Property["id"];
  onClick?: (propertyId: Property["id"]) => void;
  selected?: boolean;
}

export function CardProperty({
  propertyId,
  onClick,
  selected,
}: CardPropertyProps) {
  const { t } = useTranslation();
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPropertyModalOpen, setViewPropertyModalOpen] = useState(false);

  const property = usePropertyStore(fetchByIdSelector(propertyId));

  // fetchProperty effect
  useEffect(() => {
    setFetchingProperty(true);
    fetchProperty(propertyId)
      .then(setFetchPropertyResponse)
      .finally(() => setFetchingProperty(false));
  }, [propertyId, fetchProperty]);

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
      onClick={onClick && property ? () => onClick(propertyId) : undefined}
    >
      {fetchingProperty && (
        <CircularProgress size="1.4em" sx={{ padding: 1 }} />
      )}
      {!fetchingProperty && !property && (
        <Typography color="error" fontWeight="bold" sx={{ padding: 1 }}>
          {fetchPropertyResponse?.error
            ? fetchPropertyResponse?.error.message
            : t("errorMessages.propertyNotFound", { propertyId: propertyId })}
        </Typography>
      )}
      {!fetchingProperty && property && (
        <>
          <Stack direction="row" spacing={1}>
            {selected !== undefined && (
              <Checkbox
                checked={selected}
                sx={{ minWidth: "1px", padding: 0 }}
              />
            )}
            <Typography variant="body1">{property.address}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setViewPropertyModalOpen(true);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>

          <CustomModal
            title={t("titles.viewProperty")}
            open={viewPropertyModalOpen}
            onClose={() => setViewPropertyModalOpen(false)}
          >
            <ViewProperty propertyId={propertyId} />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
