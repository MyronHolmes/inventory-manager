const LoadingScreen = ({ 
  message = "Loading...", 
  overlay = true 
}) => {
    return (
    <div className={overlay ? "loading-overlay" : "loading-inline"}>
      {/* Your loading animation here */}
      <p>{message}</p>
    </div>
  );
};

export default LoadingScreen;