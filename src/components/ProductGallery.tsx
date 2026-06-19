"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(
    images[0] || "/placeholder.png"
  );

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Main Image */}
      <div
        className="detail-image-wrap"
        onClick={() => setShowModal(true)}
        style={{
          aspectRatio: "1/1",
          background: "var(--surface-container)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
          cursor: "zoom-in",
        }}
      >
        <img
          src={selectedImage}
          alt={productName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              style={{
                cursor: "pointer",
                border:
                  selectedImage === img
                    ? "2px solid var(--primary)"
                    : "2px solid var(--surface-container-high)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                aspectRatio: "1/1",
              }}
            >
              <img
                src={img}
                alt={`${productName}-${index}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="image-modal"
          onClick={() => setShowModal(false)}
        >
          <button
            className="image-modal-close"
            onClick={() => setShowModal(false)}
          >
            <X size={24} />
          </button>

          <img
            src={selectedImage}
            alt={productName}
            className="image-modal-img"
          />
        </div>
      )}
    </>
  );
}