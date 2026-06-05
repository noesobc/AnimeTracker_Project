import { useState } from "react";

const initialFormData = {
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

function AnimeForm({ onCreate }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });

    setFormErrors({
      ...formErrors,
      [name]: ""
    });
  };

  const toNumberOrNull = (value) => {
    return value === "" ? null : Number(value);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required.";
    }

    if (
      formData.rating !== "" &&
      (Number(formData.rating) < 0 || Number(formData.rating) > 10)
    ) {
      errors.rating = "Rating must be between 0 and 10.";
    }

    if (
      formData.episodes !== "" &&
      formData.watchedEpisodes !== "" &&
      Number(formData.watchedEpisodes) > Number(formData.episodes)
    ) {
      errors.watchedEpisodes =
        "Watched episodes cannot be greater than total episodes.";
    }

    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const animeToSend = {
      ...formData,
      year: toNumberOrNull(formData.year),
      episodes: toNumberOrNull(formData.episodes),
      watchedEpisodes: toNumberOrNull(formData.watchedEpisodes),
      rating: toNumberOrNull(formData.rating)
    };

    onCreate(animeToSend);
    setFormData(initialFormData);
    setFormErrors({});
  };

  return (
    <form className="anime-form" onSubmit={handleSubmit}>
      <h2>Add New Anime</h2>

      <div className="form-grid">
        <div>
          <input
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
          />
          {formErrors.title && (
            <p className="field-error">{formErrors.title}</p>
          )}
        </div>

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

        <div>
          <input
            name="watchedEpisodes"
            type="number"
            placeholder="Watched episodes"
            value={formData.watchedEpisodes}
            onChange={handleChange}
          />
          {formErrors.watchedEpisodes && (
            <p className="field-error">{formErrors.watchedEpisodes}</p>
          )}
        </div>

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="WATCHING">Watching</option>
          <option value="PLANNED">Planned</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="DROPPED">Dropped</option>
        </select>

        <div>
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
          {formErrors.rating && (
            <p className="field-error">{formErrors.rating}</p>
          )}
        </div>

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

      <button type="submit" className="primary-button">
        Add Anime
      </button>
    </form>
  );
}

export default AnimeForm;