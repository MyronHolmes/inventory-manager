import { formatColumnName } from "./tableConfig";

export const columnsToHide = ["id", "updated_by_user_id"];

const defaultCol = {
    cellDataType: "text",
    cellStyle: { "white-space": "pre" },
    filter: "agSetColumnFilter",
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
    filter: "agSetColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const phoneCol = {
    cellDataType: "text",
    cellEditorParams: { maxLength: 10 },
    filter: "agSetColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const numberCol = {
    cellDataType: "number",
    filter: "agSetColumnFilter",
    filterParams: { buttons: ["clear"] }
}
const enumStageCol = {
    cellDataType: "text",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
        values: ["admin", "manager", "employee"]
    },
    filter: "agSetColumnFilter",
    filterParams: { buttons: ["clear"] }
}

export const tableMap = {
    "users": {
        "id": defaultCol,
        "first_name": defaultCol,
        "last_name": defaultCol,
        "email": defaultCol,
        "role": defaultCol,
        "password": defaultCol,
        "created_by": dateTimeCol,
        "updated_at": dateTimeCol
    },
    "colors": {
        "id": defaultCol,
        "color": defaultCol,
        "created_by": dateTimeCol,
        "updated_at": dateTimeCol
    },
    "categories": {
        "id": defaultCol,
        "category": defaultCol,
        "created_by": dateTimeCol,
        "updated_at": dateTimeCol
    },
    "sizes": {
        "id": defaultCol,
        "size": defaultCol,
        "created_by": dateTimeCol,
        "updated_at": dateTimeCol
    },
    "products": {
        "id": defaultCol,
        "product": defaultCol,
        "description": defaultCol,
        "category_id": defaultCol,
        "photo_url": defaultCol,
        "quantity": numberCol,
        "status": defaultCol,
        "created_by": dateTimeCol,
        "updated_at": dateTimeCol
    },
    "product_variants": {
        "id": defaultCol,
        "product_id": defaultCol,
        "size_id": defaultCol,
        "color_id": defaultCol,
        "quantity": numberCol,
        "created_by": dateTimeCol,
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