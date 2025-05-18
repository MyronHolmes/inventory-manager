export default function VideoBackground() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  objectFit: 'cover',
  zIndex: -1,
  filter: 'brightness(0.7) saturate(1.2)',
}}

    >
      <source src="/videos/paint.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
