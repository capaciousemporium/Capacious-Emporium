"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCategoryPage({
  params,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);

const fileInputRef =
  useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const { id } = await params;

        const res = await fetch(
          `/api/admin/categories/${id}`
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load category"
          );
        }

        const category = await res.json();

        setFormData({
          name: category.name || "",
          slug: category.slug || "",
          image: category.image || "",
        });
      } catch (err) {
        setError(
          "Failed to load category."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [params]);

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setUploading(true);

  try {
    const data = new FormData();

    data.append("file", file);

    const res = await fetch(
      "/api/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();

    if (result.success) {
      setFormData((prev) => ({
        ...prev,
        image: result.url,
      }));
    } else {
      throw new Error(
        result.error ||
          "Upload failed"
      );
    }
  } catch (err) {
    setError("Image upload failed");
  } finally {
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};


const removeImage = () => {
  setFormData((prev) => ({
    ...prev,
    image: "",
  }));
};




  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { id } = await params;

      const res = await fetch(
        `/api/admin/categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            formData
          ),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Update failed"
        );
      }

      setSuccess(
        "Category updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/categories"
        );
      }, 1200);
    } catch (err) {
      setError(
        "Failed to update category."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
        }}
      >
        <Loader2
          size={32}
          className="animate-spin"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Link
            href="/admin/categories"
            className="btn btn-tertiary"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                marginBottom: "0.25rem",
              }}
            >
              Edit Category
            </h1>

            <p
              style={{
                color:
                  "var(--on-surface-variant)",
              }}
            >
              Update category
              information.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Save size={16} />
          )}

          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background:
              "#fee2e2",
            color: "#b91c1c",
            padding: "1rem",
            borderRadius:
              "10px",
            marginBottom:
              "1rem",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background:
              "#dcfce7",
            color: "#15803d",
            padding: "1rem",
            borderRadius:
              "10px",
            marginBottom:
              "1rem",
            fontWeight: 700,
          }}
        >
          {success}
        </div>
      )}

      <div
        className="admin-card"
        style={{
          padding: "2rem",
        }}
      >
        <div
          className="form-group"
          style={{
            marginBottom:
              "1.5rem",
          }}
        >
          <label>
            Category Name
          </label>

          <input
            type="text"
            name="name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            placeholder="Enter category name"
          />
        </div>

        <div
          className="form-group"
          style={{
            marginBottom:
              "1.5rem",
          }}
        >
          <label>Slug</label>

          <input
            type="text"
            name="slug"
            value={
              formData.slug
            }
            onChange={
              handleChange
            }
            placeholder="category-slug"
          />
        </div>

        <div
  style={{
    marginTop: "2rem",
  }}
>
  <h3
    style={{
      fontSize: "1rem",
      fontWeight: 800,
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    }}
  >
    <ImageIcon size={18} />
    Category Image
  </h3>

  <div
  style={{
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  }}
>
  {formData.image ? (
    <div
      style={{
        position: "relative",
        width: "160px",
        height: "160px",
        borderRadius: "12px",
        overflow: "hidden",
        border:
          "1px solid var(--outline-variant)",
      }}
    >
      <img
        src={formData.image}
        alt="Category"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <button
        type="button"
        onClick={removeImage}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "rgba(239,68,68,.9)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  ) : (
    <>
      <button
        type="button"
        onClick={() =>
          fileInputRef.current?.click()
        }
        disabled={uploading}
        style={{
          width: "160px",
          height: "160px",
          border:
            "2px dashed var(--outline-variant)",
          borderRadius: "12px",
          background:
            "var(--surface-container-low)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          cursor: "pointer",
        }}
      >
        {uploading ? (
          <Loader2
            size={20}
            className="animate-spin"
          />
        ) : (
          <Upload size={20} />
        )}

        <span
          style={{
            fontSize: ".8rem",
            fontWeight: 700,
          }}
        >
          {uploading
            ? "Uploading..."
            : "Upload Image"}
        </span>
      </button>

      <input
        hidden
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </>
  )}
</div>
</div>

        {/* {formData.image && (
          <div
            style={{
              marginTop:
                "1.5rem",
            }}
          >
            <img
              src={
                formData.image
              }
              alt="Preview"
              style={{
                width: "120px",
                height:
                  "120px",
                objectFit:
                  "cover",
                borderRadius:
                  "12px",
                border:
                  "1px solid var(--outline-variant)",
              }}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}