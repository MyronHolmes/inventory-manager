export const Button = ({
  context,
  bgColor,
  textColor,
  onClick,
  selectedRows,
  disabled = false,
}) => {
  const shouldDisable = disabled || selectedRows?.length === 0;

  return (
    <button
      className={`bg-${bgColor}-500 text-${textColor} font-bold py-2 px-4 rounded ${
        shouldDisable
          ? "opacity-50 cursor-not-allowed"
          : `cursor-pointer hover:bg-${bgColor}-600`
      }`}
      disabled={shouldDisable}
      onClick={() => onClick?.(selectedRows?.length > 0 ? selectedRows : true)}
    >
      {context}
    </button>
  );
};

export default Button;
