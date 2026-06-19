"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  PackageOpen,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await res.json();

      setCategories(
        Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (
    id: string,
    name: string
  ) => {
    const ok = confirm(
      `Delete category "${name}" ?`
    );

    if (!ok) return;

    setDeletingId(id);

    try {
      const res = await fetch(
        `/api/admin/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setCategories((prev) =>
          prev.filter((c) => c.id !== id)
        );
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
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
          className="animate-spin"
          size={32}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            Category Management
          </h1>

          <p
            style={{
              color:
                "var(--on-surface-variant)",
              fontSize: "0.95rem",
            }}
          >
            Review and manage product
            categories.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="btn btn-primary"
          style={{
            padding: "0.8rem 1.5rem",
            borderRadius: "12px",
            fontWeight: 700,
          }}
        >
          <Plus size={18} />
          Add New Category
        </Link>
      </div>

      {/* Table */}
      <div
        className="admin-card"
        style={{
          padding: 0,
          overflow: "hidden",
          borderRadius: "16px",
          border:
            "1px solid var(--outline-variant)",
        }}
      >
        <table
          className="data-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              background:
                "var(--surface-container-low)",
            }}
          >
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "1.25rem",
                }}
              >
                Category Detail
              </th>

              <th
                style={{
                  textAlign: "left",
                }}
              >
                Slug
              </th>

              <th
                style={{
                  textAlign: "right",
                  paddingRight: "1.25rem",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                style={{
                  borderTop:
                    "1px solid var(--outline-variant)",
                }}
              >
                <td
                  style={{
                    padding: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background:
                          "var(--surface-container-low)",
                        border:
                          "1px solid var(--outline-variant)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          category.image ||
                          "/placeholder.png"
                        }
                        alt={category.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "0.95rem",
                        }}
                      >
                        {category.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td
                  style={{
                    fontSize: "0.9rem",
                  }}
                >
                  {category.slug}
                </td>

                <td
                  style={{
                    paddingRight: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent:
                        "flex-end",
                    }}
                  >
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="btn btn-tertiary btn-sm"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                      }}
                    >
                      <Edit size={16} />
                    </Link>

                    <button
                      className="btn btn-tertiary btn-sm"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        color:
                          "var(--error)",
                      }}
                      disabled={
                        deletingId ===
                        category.id
                      }
                      onClick={() =>
                        handleDelete(
                          category.id,
                          category.name
                        )
                      }
                    >
                      {deletingId ===
                      category.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: "4rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems: "center",
                      gap: "1rem",
                      color:
                        "var(--on-surface-variant)",
                    }}
                  >
                    <PackageOpen
                      size={48}
                    />

                    <p
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      No categories found.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}