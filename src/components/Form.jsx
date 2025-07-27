import { capitalizeWords, formatColumnName } from "../utils/format";

export const Form = ({
  title,
  formData,
  definitions,
  onChange,
  onSubmit,
  onClose,
}) => {
  const renderField = (fieldName, fieldDef) => {
    console.log(definitions);
    const fieldProps = {
      type: fieldDef.description.type,
      placeholder: fieldDef.description.placeholder,
      required: fieldDef.description.required,
    };
    switch (fieldDef.description.field) {
      case "input":
        return (
          <input
            type={fieldProps.type}
            name={fieldName}
            placeholder={fieldProps.placeholder}
            value={formData[fieldName]}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-700 placeholder-gray-400"
            required={fieldProps.required}
            min={fieldProps.type === "number" ? 0 : null}
          />
        );
      case "textarea":
        return (
          <textarea
            name={fieldName}
            placeholder={fieldProps.placeholder}
            value={formData[fieldName]}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-700 placeholder-gray-400 resize-none"
            rows="3"
            required={fieldProps.required}
          />
        );
      case "select":
        return (
          <select
            name={fieldName}
            value={formData[fieldName]}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-700"
            required={fieldProps.required}
          >
            <option value="" disabled>
              Select A {capitalizeWords(fieldName)}
            </option>
            {fieldDef.description[`${fieldName}Options`] ? (
              <>
                {fieldDef.description[`${fieldName}Options`].map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </>
            ) : (
              <>
                {fieldDef.enum.map((e) => (
                  <option key={e} value={e}>
                    {formatColumnName(e)}
                  </option>
                ))}
              </>
            )}
          </select>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {Object.entries(definitions).map(([colName, colDef]) => (
          <div key={colName}>{renderField(colName, colDef)}</div>
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
          >
            Add {title}
          </button>
        </div>
      </form>
    </>
  );
};
