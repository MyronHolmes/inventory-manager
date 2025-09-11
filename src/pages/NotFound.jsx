import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center border border-gray-300 rounded-lg p-8 bg-gray-600 shadow-md">
        <div className="flex justify-center items-center flex-wrap p-5 border-b-2 border-white">
          <strong className="font-bold text-9xl text-orange-500 drop-shadow-lg">
            404
          </strong>
          <h1 className="text-white">
            Sorry, The Page You're Looking For Doesn't Exist Or Has Been Removed
          </h1>
        </div>
        <div className="p-5">
          <Button
            context={"Home"}
            bgColor={"orange"}
            textColor={"white"}
            onClick={() => {
              navigate("/");
            }}
          ></Button>
        </div>
      </div>
    </div>
  );
}
