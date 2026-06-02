import { useEffect, useState } from "react";

const emptyFormData = {
  title: "",
  franchise: "",
  type: "TV",
  year: "",
  genre: "",
  episodes: "",
  watchedEpisodes: "",
  status: "WATCHING",
  rating: "",
  seen: false,
  reWatching: false,
  imageUrl: "",
  description: ""
};

const buildFormData = (anime) => {
  if (!anime) return emptyFormData;

  return {
    title: anime.title || "",
    franchise: anime.franchise || "",
    type: anime.type || "TV",
    year: anime.year ?? "",
    genre: anime.genre || "",
    episodes: anime.episodes ?? "",
    watchedEpisodes: anime.watchedEpisodes ?? "",
    status: anime.status || "WATCHING",
    rating: anime.rating ?? "",
    seen: anime.seen || false,
    reWatching: anime.reWatching || false,
    imageUrl: anime.imageUrl || "",
    description: anime.description || ""
  };
};

function AnimeModal({ anime, mode, onClose, onChangeMode, onUpdate, onDelete, relatedAnimes = [], onOpenRelated }) {
  const [formData, setFormData] = useState(buildFormData(anime));

  useEffect(() => {
    setFormData(buildFormData(anime));
  }, [anime]);

  if (!anime) {
    return null;
  }

  const genreList = anime.genre
    ? anime.genre.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const progress =
    anime.episodes &&
    anime.episodes > 0 &&
    anime.watchedEpisodes !== null &&
    anime.watchedEpisodes !== undefined
      ? Math.min(Math.round((anime.watchedEpisodes / anime.episodes) * 100), 100)
      : 0;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const toNumberOrNull = (value) => {
    return value === "" ? null : Number(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required.");
      return;
    }

    if (
      formData.episodes !== "" &&
      formData.watchedEpisodes !== "" &&
      Number(formData.watchedEpisodes) > Number(formData.episodes)
    ) {
      alert("Watched episodes cannot be greater than total episodes.");
      return;
    }

    const updatedAnime = {
      ...formData,
      year: toNumberOrNull(formData.year),
      episodes: toNumberOrNull(formData.episodes),
      watchedEpisodes: toNumberOrNull(formData.watchedEpisodes),
      rating: toNumberOrNull(formData.rating)
    };

    onUpdate(anime.id, updatedAnime);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="anime-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>

        {mode === "details" && (
          <>
            <div className="modal-cover-section">
              <img
                src={anime.imageUrl || "https://placehold.co/500x300?text=No+Image"}
                alt={anime.title}
                className="modal-cover"
              />
            </div>

            <div className="modal-content-section">
              <div className="modal-title-row">
                <div>
                  <p className="modal-eyebrow">Anime Details</p>
                  <h2>{anime.title}</h2>
                </div>

                <span className={`modal-status ${anime.status?.toLowerCase()}`}>
                  {formatStatus(anime.status)}
                </span>
              </div>

              <p className="modal-meta">
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

              <p className="modal-description">
                {anime.description || "No description available."}
              </p>

              <div className="modal-info-grid">
                <div>
                  <span className="info-label">Episodes</span>
                  <strong>
                    {anime.watchedEpisodes ?? 0} / {anime.episodes ?? "?"}
                  </strong>
                </div>

                <div>
                  <span className="info-label">Progress</span>
                  <strong>{progress}%</strong>
                </div>

                <div>
                  <span className="info-label">Rating</span>
                  <strong>{anime.rating ?? "N/A"}/10</strong>
                </div>

                <div>
                    <span className="info-label">Franchise</span>
                    <strong>{anime.franchise || "No franchise"}</strong>
                  </div>

                <div>
                  <span className="info-label">Seen</span>
                  <strong>{anime.seen ? "Yes" : "No"}</strong>
                </div>

                <div>
                  <span className="info-label">Re-watching</span>
                  <strong>{anime.reWatching ? "Yes" : "No"}</strong>
                </div>
              </div>

              <div className="progress-block modal-progress">
                <div className="progress-text">
                  <span>Watch progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="related-section">
                <div className="related-header">
                  <h3>Related Anime</h3>
                  <span>{anime.franchise || "No franchise"}</span>
                </div>

                {anime.franchise && relatedAnimes.length > 0 ? (
                  <div className="related-list">
                    {relatedAnimes.map((relatedAnime) => (
                      <button
                        key={relatedAnime.id}
                        type="button"
                        className="related-item"
                        onClick={() => onOpenRelated(relatedAnime)}
                      >
                        <div>
                          <strong>{relatedAnime.title}</strong>
                          <span>
                            {relatedAnime.type} • {relatedAnime.year || "Unknown year"}
                          </span>
                        </div>

                        <span className={`related-status ${relatedAnime.status?.toLowerCase()}`}>
                          {formatStatus(relatedAnime.status)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : anime.franchise ? (
                  <p className="related-empty">
                    No other anime from this franchise has been added yet.
                  </p>
                ) : (
                  <p className="related-empty">
                    Add a franchise name to connect this anime with related seasons, movies or side stories.
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button className="edit-button" onClick={() => onChangeMode("edit")}>
                  Edit Anime
                </button>

                <button className="delete-button" onClick={() => onDelete(anime.id)}>
                  Delete Anime
                </button>
              </div>
            </div>
          </>
        )}

        {mode === "edit" && (
          <form className="modal-edit-form" onSubmit={handleSubmit}>
            <p className="modal-eyebrow">Edit Anime</p>
            <h2>Edit {anime.title}</h2>

            <div className="form-grid modal-form-grid">
              <input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
              />

              <input
                name="franchise"
                placeholder="Franchise (e.g. Boku no Hero Academia)"
                value={formData.franchise}
                onChange={handleChange}
              />

              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="TV">TV</option>
                <option value="MOVIE">Movie</option>
                <option value="OVA">OVA</option>
                <option value="ONA">ONA</option>
                <option value="SPECIAL">Special</option>
              </select>

              <input
                name="year"
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
              />

              <input
                name="genre"
                placeholder="Genres (e.g. Action, Fantasy, Drama)"
                value={formData.genre}
                onChange={handleChange}
              />

              <input
                name="episodes"
                type="number"
                placeholder="Total episodes"
                value={formData.episodes}
                onChange={handleChange}
              />

              <input
                name="watchedEpisodes"
                type="number"
                placeholder="Watched episodes"
                value={formData.watchedEpisodes}
                onChange={handleChange}
              />

              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="WATCHING">Watching</option>
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
              </select>

              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Rating"
                value={formData.rating}
                onChange={handleChange}
              />

              <input
                name="imageUrl"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="description"
              placeholder="Short description"
              value={formData.description}
              onChange={handleChange}
            />

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="seen"
                  checked={formData.seen}
                  onChange={handleChange}
                />
                Seen
              </label>

              <label>
                <input
                  type="checkbox"
                  name="reWatching"
                  checked={formData.reWatching}
                  onChange={handleChange}
                />
                Re-watching
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => onChangeMode("details")}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AnimeModal;