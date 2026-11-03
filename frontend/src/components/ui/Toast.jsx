import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppToastContainer = () => {
  return (
    <ToastContainer
      position="bottom-left"
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      toastClassName={() =>
        "relative flex p-4 mb-3 rounded-card justify-between overflow-hidden cursor-pointer bg-surface text-text border border-border shadow-card hover:shadow-card-hover font-sans text-sm"
      }
      bodyClassName={() => "flex items-center text-sm font-medium gap-2 text-text"}
    />
  );
};

export default AppToastContainer;
