import { useFormContext } from "react-hook-form";
import { Button, FormGroup, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Location } from "../../utils/services-interface";
import { useCallback, useState } from "react";
import AddressSearch from "../AddressSearch";
//import { googleGeocodingService } from "../../services/googleApi";
import { osmMapTilesService, nominatimGeocodingService } from "../../services/nominatimOSMApi";
import CustomModal from "../CustomModal";
import { FormTextField } from "./FormTextField";

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
  const { t } = useTranslation();
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
          disabled={readOnly}
          fullWidth={false}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => setSelectLocationModalOpen(true)}
          disabled={readOnly}
        >
          {t("buttons.selectButton.label")}
        </Button>
      </FormGroup>
      <CustomModal
        title={t("titles.selectLocation")}
        open={selectLocationModalOpen}
        onClose={() => setSelectLocationModalOpen(false)}
      >
        <AddressSearch
          geocodingService={nominatimGeocodingService}
          mapTilesService={osmMapTilesService}
          onLocationSelect={onLocationSelect}
        />
      </CustomModal>
    </Stack>
  );
}
