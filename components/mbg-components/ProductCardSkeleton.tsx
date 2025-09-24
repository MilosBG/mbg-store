import React from "react";
import Container from "./Container";

export default function ProductCardSkeleton() {
  return (
    <Container>
      <div className="bg-mbg-white p-2 rounded-t-md shadow-lg w-[260px] flex flex-col">
        <div className="w-full p-4 rounded-b-md mb-2 border-b-2 border-l-1 border-r-1 border-mbg-black/7">
          <div className="h-[300px] w-[250px] max-w-full mx-auto rounded-xs animate-pulse bg-mbg-green/7" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-40 rounded-xs bg-mbg-green/7 animate-pulse" />
          <div className="h-2 w-24 rounded-xs bg-mbg-green/7 animate-pulse" />
        </div>
        <div className="mt-3 py-2 px-2 mbg-p-between">
          <div className="h-3 w-16 rounded-xs bg-mbg-green/7 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-mbg-green/7 animate-pulse" />
        </div>
      </div>
    </Container>
  );
}

