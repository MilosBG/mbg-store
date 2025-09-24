import { Search } from "lucide-react";
import React from "react";

function SearchBar() {
  return (
    <div>
      <Search className="w-5 h-5 hover:text-mbg-green text-mbg-darkgrey hover:cursor-pointer hoverEffect" />
    </div>
  );
}

export default SearchBar;
