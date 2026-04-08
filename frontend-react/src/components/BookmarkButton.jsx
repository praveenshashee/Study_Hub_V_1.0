function BookmarkButton({
  isBookmarked,
  onToggle,
  variant = "overlay",
  className = ""
}) {
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  };

  const label = isBookmarked ? "Saved" : "Save";
  const buttonClassName = `bookmark-button bookmark-button-${variant} ${
    isBookmarked ? "is-saved" : ""
  } ${className}`.trim();

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleClick}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove from saved items" : "Save this item"}
    >
      {label}
    </button>
  );
}

export default BookmarkButton;
