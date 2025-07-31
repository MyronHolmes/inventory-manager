const LoadingScreen = ({ message = "Loading...", overlay = true }) => {
  return (
    <div className={overlay ? "loading-overlay" : "loading-inline"}>
      <p>{message}</p>
    </div>
  );
};

export default LoadingScreen;
