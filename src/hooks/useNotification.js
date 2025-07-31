import { useState } from "react";

export const useNotification = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const showNotification = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setShowMessage(true);
  };

  const hideNotification = () => {
    setShowMessage(false);
    setMessageType("");
    setMessage("");
  };

  return {
    message,
    messageType,
    showMessage,
    showNotification,
    hideNotification,
  };
};
