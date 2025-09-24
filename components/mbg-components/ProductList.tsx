import { getProducts } from "@/lib/admin";
import type { Product } from "@/lib/types";
import React from "react";
import ProductCard from "./ProductCard";

const ProductList = async () => {
  const products = await getProducts({ limit: 5 });
  return (
    <div className="mt-10">
      <p className="py-3  heading2-bold">Outfits</p>
      <div className="mbg-p-between">
        {!products || products.length === 0 ? (
          <p>No Products Found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
