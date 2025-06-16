 function AddButton({ setIsModalOpen }) {
  return (
       <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          + Add Color
        </button>
  );
}      

export default AddButton;