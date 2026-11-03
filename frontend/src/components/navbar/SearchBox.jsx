import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const SearchBox = ({ onClose, autoFocus = false, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/entries?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      navigate("/entries");
    }
    onClose && onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="relative w-full flex items-center">
        <FaSearch className="absolute left-4 text-text-muted text-xs pointer-events-none" />
        <input
          name="search"
          type="search"
          autoFocus={autoFocus}
          className="bg-surface text-text border border-border rounded-full pl-10 pr-20 py-2.5 text-xs placeholder:text-text-muted w-full transition-colors focus-visible:outline-2 focus-visible:outline-primary min-h-[40px]"
          placeholder="Search thoughts & memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
