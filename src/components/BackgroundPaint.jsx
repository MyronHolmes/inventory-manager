export default function VideoBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          filter: 'brightness(0.7) saturate(1.2)',
        }}
      >
        <source src="/videos/paint.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
