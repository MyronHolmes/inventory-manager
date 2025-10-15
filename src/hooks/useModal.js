import { useState } from "react";

export const useModal = (initialFormData = {}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...initialFormData,
  });

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      ...initialFormData,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    isModalOpen,
    formData,
    openModal,
    closeModal,
    handleInputChange,
  };
};
