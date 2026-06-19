"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="btn btn-secondary"
      style={{ padding: "0.5rem 1rem" }}
      value={searchParams.get("sort") || ""}
      onChange={handleChange}
    >
      <option value="">Sort By</option>
      <option value="price_asc">
        Price Low to High
      </option>
      <option value="price_desc">
        Price High to Low
      </option>
      <option value="newest">
        Newest Arrivals
      </option>
    </select>
  );
}