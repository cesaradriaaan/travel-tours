import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Gallery.css";

export default function Gallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <img
          src={images[index]}
          alt={`${alt} — photo ${index + 1}`}
          decoding="async"
          fetchPriority="high"
          width="1600"
          height="800"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              className="gallery__arrow gallery__arrow--left"
              onClick={prev}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="gallery__arrow gallery__arrow--right"
              onClick={next}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="gallery__thumbs">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              className={`gallery__thumb ${i === index ? "is-active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                decoding="async"
                width="84"
                height="63"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
