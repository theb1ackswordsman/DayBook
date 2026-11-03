import React from "react";
import Modal from "./ui/Modal";

const ModalLayout = ({ isOpen, close, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={close}>
      {children}
    </Modal>
  );
};

export default ModalLayout;
