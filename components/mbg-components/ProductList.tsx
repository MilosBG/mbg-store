import { getProducts } from "@/lib/admin";
import React from "react";
import ProductRail from "./ProductRail";

const ProductList = async () => {
  const products = await getProducts({
    limit: 12,
  });

  return (
    <section className="mt-10 w-full">
      <ProductRail products={products ?? []} />
    </section>
  );
};

export default ProductList;