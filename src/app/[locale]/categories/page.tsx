import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      products: true, // relation thakle
    },
  });

  return (
    <div className="container section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Shop by Category</h1>
          <p className="section-subtitle">
            Browse our curated collections
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        {categories.map((cat, i) => (
          <Link
            href={`/products?category=${cat.slug}`}
            key={cat.id}
          >
            <div
              className={`card animate-in animate-delay-${
                (i % 4) + 1
              }`}
              style={{ height: "100%" }}
            >
              <div
                className="card-img-wrap"
                style={{ aspectRatio: "16 / 9" }}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(135deg,var(--surface-container),var(--surface-container-high))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: 800,
                    }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="card-body">
                <h3 className="card-title">
                  {cat.name}
                </h3>

                <span
                  className="card-meta"
                  style={{ marginTop: "0.5rem" }}
                >
                  {cat.products?.length || 0} products
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}