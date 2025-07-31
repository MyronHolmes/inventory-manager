export const Button = ({
  context,
  bgColor,
  textColor,
  onClick,
  selectedRows,
}) => {
  return (
    <button
      className={`bg-${bgColor}-500 text-${textColor} font-bold py-2 px-4 rounded ${
        selectedRows?.length === 0
          ? "opacity-50 cursor-not-allowed"
          : `cursor-pointer hover:bg-${bgColor}-600`
      }`}
      disabled={selectedRows?.length === 0}
      onClick={
        selectedRows && selectedRows.length > 0
          ? () => {
              onClick?.(selectedRows);
            }
          : () => {
              onClick(true);
            }
      }
    >
      {context}
    </button>
  );
};

export default Button;
