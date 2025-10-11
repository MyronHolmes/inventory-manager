import { useEffect, useState } from "react";

export default function VideoBackground() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          transform: "translate(-50%, -50%)",
          objectFit: "cover",
          filter: "brightness(0.7) saturate(1.2)",
          transition: "filter 0.3s ease, transform 0.3s ease",
        }}
      >
        <source src="/videos/paint.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
