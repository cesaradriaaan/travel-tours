import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  handleImageError,
  markImageLoaded,
} from "../lib/imageFallback";
import {
  getOptimizedImageSources,
  getOptimizedImageUrl,
} from "../lib/imageUrl";
import "./Gallery.css";

export default function Gallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;
  const mainImages =
    getOptimizedImageSources(
      images,
      { width: 1400, quality: 82 }
    );
  const thumbnailImages =
    getOptimizedImageSources(
      images,
      { width: 240, quality: 70 }
    );

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="gallery">
      <div className="gallery__main image-loader">
        <img
          key={`${images[index]}-${index}`}
          src={mainImages[index]}
          srcSet={`${getOptimizedImageUrl(
            images[index],
            { width: 900, quality: 80 }
          )} 900w, ${mainImages[index]} 1400w`}
          sizes="(max-width: 768px) 94vw, 1200px"
          alt={`${alt} - photo ${index + 1}`}
          decoding="async"
          fetchpriority="high"
          width="1600"
          height="800"
          onLoad={markImageLoaded}
          onError={(event) =>
            handleImageError(
              event,
              mainImages,
              index
            )
          }
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
          {thumbnailImages.map((img, i) => (
            <button
              type="button"
              key={i}
              className={`gallery__thumb image-loader ${i === index ? "is-active" : ""}`}
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
                onLoad={markImageLoaded}
                onError={(event) =>
                  handleImageError(
                    event,
                    thumbnailImages,
                    i
                  )
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
