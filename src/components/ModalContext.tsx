import { createContext, ReactNode, useContext, useState } from "react";

import { Modal } from "./Modal";

export interface ModalContext {
  pushModal: (modal: Modal) => void;
  popModal: () => void;
}

const modalContext = createContext<ModalContext>({
  pushModal: () => {},
  popModal: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useModalContext = () => {
  return useContext(modalContext);
};

export interface ModalContextProviderProps {
  children?: ReactNode;
}

export default function ModalContextProvider({
  children,
}: ModalContextProviderProps) {
  const [modalStack, setModalStack] = useState([] as Modal[]);

  const pushModal = (modal: Modal) => {
    setModalStack((prevModalStack) => [...prevModalStack, modal]);
  };

  const popModal = () => {
    setModalStack((prevModalStack) =>
      prevModalStack.slice(0, prevModalStack.length - 1)
    );
  };

  return (
    <modalContext.Provider value={{ pushModal, popModal }}>
      {children && children}
      {...modalStack}
    </modalContext.Provider>
  );
}
