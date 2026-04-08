function SortSelect({ sortOption, setSortOption }) {
  return (
    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
      <option value="">Default</option>
      <option value="title-asc">Title A-Z</option>
      <option value="title-desc">Title Z-A</option>
      <option value="views-asc">Views Low-High</option>
      <option value="views-desc">Views High-Low</option>
    </select>
  );
}

export default SortSelect;