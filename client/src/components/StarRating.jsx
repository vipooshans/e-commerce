const StarRating = ({ rating = 0, maxStars = 5, interactive = false, onRate, size = 16 }) => {
  return (
    <div className="stars" role={interactive ? 'group' : 'img'} aria-label={`Rating: ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              cursor: interactive ? 'pointer' : 'default',
              color: filled ? '#FBBF24' : '#3D3558',
              transition: 'color 0.15s',
              userSelect: 'none',
            }}
            onClick={() => interactive && onRate && onRate(i + 1)}
            aria-label={`${i + 1} star`}
            role={interactive ? 'button' : undefined}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
