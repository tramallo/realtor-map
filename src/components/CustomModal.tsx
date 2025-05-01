import { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Slide,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type CustomModalProps = Omit<DialogProps, "children" | "onClose"> & {
  title: string;
  children: ReactNode;
  onClose?: () => void;
};

export default function CustomModal({
  title,
  children,
  onClose,
  ...props
}: CustomModalProps) {
  return (
    <Dialog
      {...props}
      slots={{ transition: Slide }}
      slotProps={{
        transition: {
          direction: "up",
          timeout: 400,
        },
        paper: {
          sx: {
            width: "90%",
            maxWidth: "100%",
            maxHeight: "95%",
            margin: 0,
          },
        },
      }}
    >
      <DialogTitle
        display="flex"
        alignItems="end"
        justifyContent="space-between"
        sx={{ padding: 1 }}
      >
        {title}
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{ visibility: onClose ? "visible" : "hidden" }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack direction="column" width="100%">
          {children}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
