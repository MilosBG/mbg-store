// ✅ Must be the very first line
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import ProductCard from "@/components/mbg-components/ProductCard";
import Separator from "@/components/mbg-components/Separator";
import { getSearchedProducts } from "@/lib/actions/actions";

// Next.js (edge/runtime) exposes params as an async value in this setup
const SearchPage = async (props: { params: Promise<{ query: string }> }) => {
  const { params } = props;
  const { query: raw } = await params;
  const query = decodeURIComponent(raw);
  const searchedProducts = await getSearchedProducts(query);

  return (
    <Container className="mt-4 min-h-[50vh]">
      <H2>Search results for {query}</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />
      {!searchedProducts || searchedProducts.length === 0 ? (
        <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
          No Result Found...
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {searchedProducts.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
