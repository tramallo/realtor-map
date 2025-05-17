import { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Slide,
  SlideProps,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type CustomModalProps = Omit<DialogProps, "children" | "onClose"> & {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  slideDirection?: SlideProps["direction"];
};

export default function CustomModal({
  title,
  children,
  onClose,
  slideDirection = "up",
  ...dialogProps
}: CustomModalProps) {
  return (
    <Dialog
      {...dialogProps}
      slots={{ transition: Slide }}
      slotProps={{
        transition: {
          direction: slideDirection,
          timeout: 400,
        },
        paper: {
          sx: () => ({
            boxSizing: "border-box",
            maxWidth: "100%",
            maxHeight: "100%",
            width: "90svw",
            height: "85svh",
            margin: 0,
            border: "2px solid black",
            borderRadius: 2,
          }),
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="end"
        justifyContent="space-between"
        boxSizing="border-box"
        padding={1}
        sx={(theme) => ({
          backgroundColor: theme.palette.grey[400],
        })}
      >
        <Typography variant="h6" textOverflow="ellipsis" color="primary" noWrap>
          {title}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={
            onClose
              ? (event) => {
                  event.stopPropagation();
                  onClose();
                }
              : undefined
          }
          sx={{ visibility: onClose ? "visible" : "hidden" }}
        >
          <CloseIcon />
        </Button>
      </Stack>
      <DialogContent
        sx={(theme) => ({
          padding: 0,
          boxSizing: "border-box",
          backgroundColor: theme.palette.grey[500],
        })}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
