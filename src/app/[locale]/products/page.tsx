import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { convertUsdToCurrency, formatCurrency, normalizeCurrency } from "@/lib/currency";
import ProductSort from "@/components/ProductSort";
export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { category: categorySlug, sort } = await searchParams;
  const head = await headers();
  const currency = normalizeCurrency(head.get("x-detected-currency") || "INR");
const displayLocale =
  locale === "en"
    ? "en-IN"
    : locale === "fr"
    ? "fr-FR"
    : locale === "de"
    ? "de-DE"
    : "en-IN";
  const products = await prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    include: { category: true },
    orderBy: sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="container section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Shop the Collection</h1>
          <p className="section-subtitle">
            {categorySlug ? `Viewing items in ${categories.find(c => c.slug === categorySlug)?.name}` : "Browse our full range of curated pieces."}
          </p>
        </div>
        
        {/* Simple Filters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ProductSort />
        </div>
      </div>

      <div className="grid grid-4">
        {products.map((product, i) => {
          const images = (product.images || []) as string[];
          const convertedPrice = convertUsdToCurrency(product.salePrice || product.price, currency);
          const convertedOldPrice = convertUsdToCurrency(product.price, currency);
          return (
            <Link href={`/${locale}/products/${product.slug}`} key={product.id}>
              <div className={`card animate-in animate-delay-${(i % 4) + 1}`}>
                <div className="card-img-wrap">
                  <img src={images[0] || "/placeholder.png"} alt={product.name} />
                </div>
                <div className="card-body">
                  <span className="card-meta">{product.category?.name || "Uncategorized"}</span>
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-price">
  ₹{Number(product.salePrice || product.price).toLocaleString("en-IN")}
  {product.salePrice && (
    <span className="card-price-old">
      ₹{Number(product.price).toLocaleString("en-IN")}
    </span>
  )}
</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <h2>No items found in this curation.</h2>
          <p>Please adjust your filters or browse the full catalog.</p>
          <Link href={`/${locale}/products`} className="btn btn-primary">Reset Filters</Link>
        </div>
      )}
    </div>
  );
}
