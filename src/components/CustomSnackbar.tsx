import { IconButton, Slide, Snackbar, SnackbarProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type CustomSnackbarProps = Omit<SnackbarProps, "onClose"> & {
  onClose?: () => void;
};

export default function CustomSnackbar(props: CustomSnackbarProps) {
  return (
    <Snackbar
      {...props}
      onClose={(_event, reason) => {
        if (reason === "clickaway" || !props.onClose) {
          return;
        }
        props.onClose();
      }}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      slots={{ transition: Slide }}
      slotProps={{ transition: { direction: "left" } }}
      action={
        props.onClose ? (
          <IconButton onClick={() => props.onClose!()}>
            <CloseIcon />
          </IconButton>
        ) : undefined
      }
    />
  );
}
