import { useState } from 'react';

// Photo gallery (REQ-2.5). images = [{ url, title }]
export default function Gallery({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return <div className="gallery-empty muted small">No photos added yet.</div>;
  }

  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className="gallery">
      <img className="gallery-main" src={current.url} alt={current.title || 'Service photo'} />
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button key={img.url} type="button" className={`gallery-thumb ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>
              <img src={img.url} alt={img.title || `Photo ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
