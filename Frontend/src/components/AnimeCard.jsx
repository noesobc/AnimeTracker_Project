function AnimeCard({ anime, onView }) {
  const genreList = anime.genre
    ? anime.genre.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const hasKnownTotalEpisodes =
    anime.episodes !== null && anime.episodes !== undefined && anime.episodes > 0;

  const progress = hasKnownTotalEpisodes
    ? Math.min(Math.round(((anime.watchedEpisodes ?? 0) / anime.episodes) * 100), 100)
    : null;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      onView(anime);
    }
  };

  return (
    <div
      className="anime-card clickable-card"
      onClick={() => onView(anime)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="anime-cover-wrapper">
        <img
          src={anime.imageUrl || "https://placehold.co/400x240?text=No+Image"}
          alt={anime.title}
          className="anime-cover"
        />

        <span className={`card-status ${anime.status?.toLowerCase()}`}>
          {formatStatus(anime.status)}
        </span>
      </div>

      <div className="anime-card-content">
        <h3>{anime.title}</h3>

        <p className="anime-card-meta">
          {anime.type} • {anime.year || "Unknown year"}
        </p>

        <div className="genre-tags">
          {genreList.length > 0 ? (
            genreList.map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))
          ) : (
            <span className="genre-tag">No genre</span>
          )}
        </div>

        <div className="progress-block">
          <div className="progress-text">
            {hasKnownTotalEpisodes ? (
              <>
                <span>
                  {anime.watchedEpisodes ?? 0} / {anime.episodes} episodes
                </span>
                <span>{progress}%</span>
              </>
            ) : (
              <>
                <span>{anime.watchedEpisodes ?? 0} episodes watched</span>
                <span>Ongoing</span>
              </>
            )}
          </div>

          {hasKnownTotalEpisodes ? (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          ) : (
            <div className="progress-bar ongoing-progress-bar">
              <div className="ongoing-progress-fill"></div>
            </div>
          )}
        </div>

        <div className="anime-card-footer">
          <span>Rating: {anime.rating ?? "N/A"}/10</span>
          <span>{anime.seen ? "Seen" : "Not seen"}</span>
        </div>
      </div>
    </div>
  );
}

export default AnimeCard;