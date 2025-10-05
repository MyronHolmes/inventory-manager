import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { myTheme } from "../utils/tableConfig";
import Button from "../components/Button";
import Notification from "./Notification";
import { Trash2 } from "lucide-react";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";
import { useTableManager } from "../hooks/useTableManager";
import { useNotification } from "../hooks/useNotification";
import { useModal } from "../hooks/useModal";
import LoadingScreen from "../components/LoadingScreen";
import { capitalizeWords } from "../../shared/utils/helperFunctions"; 

ModuleRegistry.registerModules([AllCommunityModule]);

function DynamicTableContent({ defaultFormData = {}, location, user }) {
  const [selectedRows, setSelectedRows] = useState([]);
  const {
    rowData,
    columnDefs,
    formDefs,
    title,
    tableLoading,
    error: tableError,
    operationLoading,
    createRecord,
    updateRecord,
    deleteRecords,
    refreshData,
  } = useTableManager(location, user);

  const {
    message,
    messageType,
    showMessage,
    showNotification,
    hideNotification,
  } = useNotification();

  const { isModalOpen, formData, openModal, closeModal, handleInputChange } =
    useModal(defaultFormData);

  const isButtonsDisabled = useMemo(() => {
    if (location.pathname === "/users") {
      return user.role !== "admin";
    }
    return false;
  }, [location.pathname, user.role]);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      filter: true,
      sortable: true,
      minWidth: 150
    }),
    []
  );
  const rowSelection = useMemo(
    () =>
      isButtonsDisabled
        ? false
        : {
            mode: "multiRow",
            headerCheckbox: false,
          },
    [isButtonsDisabled]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = await createRecord(formData, showNotification, title);
      if (result.success) {
        closeModal();
      }
    },
    [createRecord, formData, showNotification, closeModal]
  );

  const onRowValueChanged = useCallback(
    async (event) => {
      await updateRecord(event.data, showNotification, title);
    },
    [updateRecord, showNotification]
  );

  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  const handleDelete = useCallback(
    async (rows) => {
      if (rows.length === 0) return;

      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${rows.length} ${title.toLowerCase()}(s)?`
      );

      if (confirmDelete) {
        await deleteRecords(rows, showNotification, title);
        setSelectedRows([]);
      }
    },
    [deleteRecords, showNotification, title]
  );

  if (tableLoading) {
    return (
      <LoadingScreen
        message={`Loading The ${capitalizeWords(location.pathname.slice(1))}...`}
        size={"large"}
      />
    );
  }
  // Error state
  if (tableError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading {title}
          </h2>
          <p className="text-gray-600 mb-4">{tableError}</p>
          <Button
            context="Retry"
            bgColor="orange"
            textColor="white"
            onClick={refreshData}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="ag-theme-alpine p-4 space-y-6 min-h-screen">
      {showMessage && (
        <Notification
          type={messageType}
          message={message}
          onClose={hideNotification}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">
          {title} Management
        </h1>
        <Button
          context={"+ Add " + title}
          bgColor="orange"
          textColor="white"
          onClick={openModal}
          disabled={isButtonsDisabled}
        ></Button>
      </div>

      <div
        className="ag-theme-alpine p-3"
        style={{ height: 600, width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={myTheme}
          rowSelection={rowSelection}
          editType={"fullRow"}
          onRowValueChanged={onRowValueChanged}
          onSelectionChanged={onSelectionChanged}
          autoSizeStrategy={ {type: 'fitGridWidth'} }
        />
      </div>
      <div className="flex flex-row-reverse m-0 p-0">
        <Button
          context={<Trash2 />}
          bgColor="red"
          textColor="white"
          onClick={handleDelete}
          selectedRows={selectedRows}
          disabled={isButtonsDisabled}
        ></Button>
      </div>

      {/* Add Form Modal */}
      {isModalOpen && (
        <Modal title={"Add New " + title} onClose={closeModal}>
          <Form
            title={title}
            formData={formData}
            definitions={formDefs}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={operationLoading}
            onClose={closeModal}
          ></Form>
        </Modal>
      )}
    </div>
  );
}
export default DynamicTableContent;
