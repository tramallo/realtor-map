import { useFormContext } from "react-hook-form";
import { Button, FormGroup, Stack } from "@mui/material";

import FormTextField from "./FormTextField";
import { Location } from "../../utils/mapServicesSchemas";
import { useCallback, useState } from "react";
import AddressSearch from "../AddressSearch";
import { googleGeocodingService } from "../../utils/googleApi";
import { osmMapTilesService } from "../../utils/nominatimOSMApi";
import CustomModal from "../CustomModal";

export interface FormLocationFieldProps {
  addressFieldName: string;
  coordinatesFieldName: string;
  label: string;
  defaultValue?: Location;
  readOnly?: boolean;
}

export default function FormLocationField({
  addressFieldName,
  coordinatesFieldName,
  label,
  defaultValue,
  readOnly,
}: FormLocationFieldProps) {
  const { setValue } = useFormContext();

  const [selectLocationModalOpen, setSelectLocationModalOpen] = useState(false);

  const setLocation = useCallback(
    (location: Location) => {
      setValue(addressFieldName, location.address);
      setValue(`${coordinatesFieldName}.lat`, location.coordinates.lat);
      setValue(`${coordinatesFieldName}.lng`, location.coordinates.lng);
    },
    [addressFieldName, coordinatesFieldName, setValue]
  );

  const onLocationSelect = useCallback(
    (location: Location) => {
      setLocation(location);
      setSelectLocationModalOpen(false);
    },
    [setLocation]
  );

  return (
    <Stack spacing={1}>
      <FormGroup row>
        <FormTextField
          fieldName={addressFieldName}
          label={label}
          defaultValue={defaultValue?.address}
          readOnly
          fullWidth={false}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => setSelectLocationModalOpen(true)}
          disabled={readOnly}
        >
          Select
        </Button>
      </FormGroup>
      <CustomModal
        title="Select location"
        open={selectLocationModalOpen}
        onClose={() => setSelectLocationModalOpen(false)}
      >
        <AddressSearch
          geocodingService={googleGeocodingService}
          mapTilesService={osmMapTilesService}
          onLocationSelect={onLocationSelect}
        />
      </CustomModal>
    </Stack>
  );
}
