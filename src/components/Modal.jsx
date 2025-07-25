export const Modla = ({ formData, title, context, definitions, onClose, onSubmit }) => {
  return (
    <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-400">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-red-400 text-2xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div>
              {context}
            </div>
          </div>
        </div>
    </>
  )
}
