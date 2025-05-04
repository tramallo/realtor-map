import { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Slide,
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
          sx: () => ({
            boxSizing: "border-box",
            maxWidth: "100%",
            maxHeight: "100%",
            margin: 0,
            border: "2px solid black",
            borderRadius: 2,
          }),
        },
      }}
    >
      <DialogTitle
        display="flex"
        alignItems="end"
        justifyContent="space-between"
        sx={(theme) => ({
          padding: 1,
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.grey[400],
        })}
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
      <DialogContent
        sx={(theme) => ({
          padding: 0,
          boxSizing: "border-box",
          width: "90svw",
          height: "85svh",
          backgroundColor: theme.palette.grey[500],
        })}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
