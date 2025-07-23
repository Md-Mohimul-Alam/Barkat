// src/components/Toast.jsx
import React from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Export a reusable ToastContainer with default props
export const Toast = () => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Slide} // or Bounce, Flip, Zoom
  />
);

// Helper functions for different toast types, to keep your code clean
export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);
export const notifyInfo = (msg) => toast.info(msg);
export const notifyWarning = (msg) => toast.warn(msg);
export const notifyDefault = (msg) => toast(msg);
