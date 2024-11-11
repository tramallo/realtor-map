import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, Slide } from "@mui/material";

export interface ModalProps {
  title: string;
  children: ReactNode;
}

export default function Modal({ title, children }: ModalProps) {
  return (
    <Dialog open={true}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export type Modal = typeof Modal;
