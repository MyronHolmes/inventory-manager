import { formatColumnName } from "./format";

export const columnsToHide = ["password"];

const defaultCol = {
    cellDataType: "text",
    editable: true,
    cellEditor: "agTextCellEditor",
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const dateTimeCol = {
    cellDataType: "dateString",
    filter: "agDateColumnFilter",
    filterParams: {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            const cellDate = new Date(cellValue);
            if (filterLocalDateAtMidnight.getTime() === cellDate.setHours(0, 0, 0, 0)) return 0;
            return cellDate < filterLocalDateAtMidnight ? -1 : 1;
        },
        buttons: ["clear"]
    },
    valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    },
}
const dateCol = {
    cellDataType: "dateString",
    filter: "agDateColumnFilter",
    filterParams: {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            const cellDate = new Date(cellValue);
            if (filterLocalDateAtMidnight.getTime() === cellDate.setHours(0, 0, 0, 0)) return 0;
            return cellDate < filterLocalDateAtMidnight ? -1 : 1;
        },
        buttons: ["clear"]
    },
    valueFormatter: (params) => {
        if (!params.value) return "";
        return new Date(params.value).toLocaleDateString("en-US");
    },
}
const activeCol = {
    cellDataType: "boolean",
    cellRendererParams: { disabled: true },
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const phoneCol = {
    cellDataType: "text",
    cellEditorParams: { maxLength: 10 },
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const numberCol = {
    cellDataType: "number",
    cellEditor: 'agNumberCellEditor',
    editable: true,
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const enumStageCol = {
    cellDataType: "text",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
        values: ["admin", "manager", "employee"]
    },
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const agSelectCol = {
    cellDataType: "text",
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
        values: []
    },
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["clear"] }
}
export const tableMap = {
    "users": {
        "id": {... defaultCol, editable: false},
        "first_name": defaultCol,
        "last_name": defaultCol,
        "email": defaultCol,
        "role": defaultCol,
        "password": defaultCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    },
    "colors": {
        "id": {... defaultCol, editable: false},
        "color": defaultCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    },
    "categories": {
        "id": {... defaultCol, editable: false},
        "category": defaultCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    },
    "sizes": {
        "id": {... defaultCol, editable: false},
        "size": defaultCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    },
     "products": {
        "id": {... defaultCol, editable: false},
        "product": defaultCol,
        "description": defaultCol,
        "category": agSelectCol,
        "quantity": numberCol,
        "status": agSelectCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    },
    "product_variants": {
        "id": {... defaultCol, editable: false},
        "product": agSelectCol,
        "size": agSelectCol,
        "color": agSelectCol,
        "quantity": numberCol,
        "created_by": {... defaultCol, editable: false},
        "created_at": dateTimeCol,
        "updated_by": {... defaultCol, editable: false},
        "updated_at": dateTimeCol
    }
}

export function createColDef(data, config) {
    let tableConfig = {}
    if (config in tableMap) {
        tableConfig = tableMap[config]
    }

    return Object.keys(data).map((key) => {
        if (columnsToHide.includes(key)) {
            return { field: key, hide: true };
        }
        if (key in tableConfig) {
            return { ...tableConfig[key], field: key, headerName: formatColumnName(key) };
        }
        return { ...defaultCol, field: key, headerName: formatColumnName(key) }
    });
}