import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { Property } from "../../utils/data-schema";
import {
  fetchByIdSelector,
  usePropertyStore,
} from "../../stores/propertiesStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewProperty from "./ViewProperty";
import PersonChip from "../PersonChip";

export interface CardPropertyProps {
  propertyId: Property["id"];
  onClick?: (propertyId: Property["id"]) => void;
}

export function CardProperty({ propertyId, onClick }: CardPropertyProps) {
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
    <Box
      width="100%"
      borderRadius={2}
      paddingInline={1}
      sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      onClick={onClick ? () => onClick(propertyId) : undefined}
    >
      {fetchingProperty && <CircularProgress size="1.4em" />}
      {!fetchingProperty && !property && (
        <Typography color="error" sx={{ paddingInline: 2 }}>
          {fetchPropertyResponse?.error
            ? fetchPropertyResponse?.error.message
            : "Property not found"}
        </Typography>
      )}
      {!fetchingProperty && property && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography>{property.address}</Typography>
          <Stack direction="row" spacing={1}>
            {property.ownerId && <PersonChip personId={property.ownerId} />}
            <IconButton onClick={() => setViewPropertyModalOpen(true)}>
              <VisibilityIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}

      <CustomModal
        title={`View Property: ${propertyId}`}
        open={viewPropertyModalOpen}
        onClose={() => setViewPropertyModalOpen(false)}
      >
        <ViewProperty propertyId={propertyId} />
      </CustomModal>
    </Box>
  );
}
