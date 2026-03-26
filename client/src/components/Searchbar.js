import "../layout/SearchBar.css";

function SearchBar({ onSearch }) {
  return (
    <div className="search-bar">
      <input
      type="text"
      placeholder="Tìm sản phẩm..."
      onChange={(e) => onSearch(e.target.value)}
    />
    </div>
  );
}

export default SearchBar;