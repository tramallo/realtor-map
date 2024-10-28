import { ReactNode } from "react";

import "./Modal.css";

export interface ModalProps {
  title: string;
  children: ReactNode;
}

export default function Modal({ title, children }: ModalProps) {
  return (
    <div className="modal">
      <div className="modal-pane">
        <label>{title}</label>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
