import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import AnimeForm from "./components/AnimeForm";
import AnimeCard from "./components/AnimeCard";
import AnimeModal from "./components/AnimeModal";
import WatchingProgressTable from "./components/WatchingProgressTable";

import {
  createAnime,
  deleteAnime,
  getAllAnimes,
  updateAnime
} from "./services/animeService";

function App() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genreFilter, setGenreFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("NONE");

  const [selectedAnime, setSelectedAnime] = useState(null);
  const [modalMode, setModalMode] = useState("details");

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const prepareAnimeForSave = (anime) => {
    const hasKnownTotalEpisodes =
      anime.episodes !== null &&
      anime.episodes !== undefined &&
      Number(anime.episodes) > 0;

    const hasWatchedEpisodes =
      anime.watchedEpisodes !== null &&
      anime.watchedEpisodes !== undefined;

    if (
      hasKnownTotalEpisodes &&
      hasWatchedEpisodes &&
      Number(anime.watchedEpisodes) === Number(anime.episodes)
    ) {
      return {
        ...anime,
        status: "COMPLETED",
        seen: true
      };
    }

    return anime;
  };

  const loadAnimes = async () => {
    try {
      const response = await getAllAnimes();
      setAnimes(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error loading animes:", error);
      setErrorMessage("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnimes();
  }, []);

  const handleCreateAnime = async (anime) => {
    try {
      const animeToSave = prepareAnimeForSave(anime);
      await createAnime(animeToSave);
      await loadAnimes();
      showToast("Anime added successfully.");
    } catch (error) {
      console.error("Error creating anime:", error);
      showToast("Could not create anime. Please check the form data.", "error");
    }
  };

  const handleUpdateAnime = async (id, anime) => {
    try {
      const animeToSave = prepareAnimeForSave(anime);
      await updateAnime(id, animeToSave);
      await loadAnimes();
      setSelectedAnime(null);
      setModalMode("details");
      showToast("Anime updated successfully.");
    } catch (error) {
      console.error("Error updating anime:", error);
      showToast("Could not update anime. Please check the form data.", "error");
    }
  };

  const handleQuickUpdateAnime = async (id, anime) => {
    try {
      const animeToSave = prepareAnimeForSave(anime);
      await updateAnime(id, animeToSave);
      await loadAnimes();

      if (animeToSave.status === "COMPLETED") {
        showToast("Anime marked as completed.");
      } else {
        showToast("Episode progress updated.");
      }
    } catch (error) {
      console.error("Error updating anime:", error);
      showToast("Could not update anime. Please check the form data.", "error");
    }
  };

  const handleDeleteAnime = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this anime?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteAnime(id);
      await loadAnimes();

      if (selectedAnime?.id === id) {
        setSelectedAnime(null);
      }

      showToast("Anime deleted successfully.");
    } catch (error) {
      console.error("Error deleting anime:", error);
      showToast("Could not delete anime.", "error");
    }
  };

  const openDetails = (anime) => {
    setSelectedAnime(anime);
    setModalMode("details");
  };

  const closeModal = () => {
    setSelectedAnime(null);
    setModalMode("details");
  };

  const getAnimeGenres = (anime) => {
    if (!anime.genre) {
      return [];
    }

    return anime.genre
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean);
  };

  const allGenres = Array.from(
    new Set(animes.flatMap((anime) => getAnimeGenres(anime)))
  ).sort((a, b) => a.localeCompare(b));

  const watchingAnimes = animes.filter((anime) => anime.status === "WATCHING");

  const filteredAnimes = useMemo(() => {
    const filtered = animes.filter((anime) => {
      const matchesTitle = anime.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || anime.status === statusFilter;

      const animeGenres = getAnimeGenres(anime);

      const matchesGenre =
        genreFilter === "ALL" || animeGenres.includes(genreFilter);

      return matchesTitle && matchesStatus && matchesGenre;
    });

    const sorted = [...filtered];

    sorted.sort((a, b) => {
      if (sortOption === "TITLE_ASC") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortOption === "YEAR_DESC") {
        return (b.year ?? -Infinity) - (a.year ?? -Infinity);
      }

      if (sortOption === "YEAR_ASC") {
        return (a.year ?? Infinity) - (b.year ?? Infinity);
      }

      if (sortOption === "RATING_DESC") {
        return (b.rating ?? -Infinity) - (a.rating ?? -Infinity);
      }

      if (sortOption === "RATING_ASC") {
        return (a.rating ?? Infinity) - (b.rating ?? Infinity);
      }

      return 0;
    });

    return sorted;
  }, [animes, searchText, statusFilter, genreFilter, sortOption]);

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("ALL");
    setGenreFilter("ALL");
    setSortOption("NONE");
  };

  const hasActiveFilters =
    searchText !== "" ||
    statusFilter !== "ALL" ||
    genreFilter !== "ALL" ||
    sortOption !== "NONE";

  const stats = useMemo(() => {
    const total = animes.length;
    const watching = animes.filter((anime) => anime.status === "WATCHING").length;
    const completed = animes.filter((anime) => anime.status === "COMPLETED").length;
    const planned = animes.filter((anime) => anime.status === "PLANNED").length;
    const other = Math.max(total - watching - completed - planned, 0);

    return {
      total,
      watching,
      completed,
      planned,
      other
    };
  }, [animes]);

  const pieStyle = useMemo(() => {
    const total = stats.total || 1;

    const watchingDeg = (stats.watching / total) * 360;
    const completedDeg = (stats.completed / total) * 360;
    const plannedDeg = (stats.planned / total) * 360;
    const otherDeg = (stats.other / total) * 360;

    return {
      background: `conic-gradient(
        #5b8cff 0deg ${watchingDeg}deg,
        #41c98a ${watchingDeg}deg ${watchingDeg + completedDeg}deg,
        #9b6dff ${watchingDeg + completedDeg}deg ${watchingDeg + completedDeg + plannedDeg}deg,
        #4a4a5f ${watchingDeg + completedDeg + plannedDeg}deg ${watchingDeg + completedDeg + plannedDeg + otherDeg}deg
      )`
    };
  }, [stats]);

  const normalizeText = (value) => {
    return value ? value.trim().toLowerCase() : "";
  };

  const relatedAnimes = selectedAnime
    ? animes.filter((anime) => {
      const selectedFranchise = normalizeText(selectedAnime.franchise);
      const animeFranchise = normalizeText(anime.franchise);

      return (
        anime.id !== selectedAnime.id &&
        selectedFranchise !== "" &&
        animeFranchise === selectedFranchise
      );
    })
    : [];

  const openRelatedAnime = (anime) => {
    setSelectedAnime(anime);
    setModalMode("details");
  };

  const handleExportJson = async () => {
    try {
      const response = await getAllAnimes();

      const jsonContent = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json"
      });

      const today = new Date().toISOString().slice(0, 10);
      const fileName = `anime-tracker-backup-${today}.json`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showToast("JSON backup exported successfully.");
    } catch (error) {
      console.error("Error exporting JSON:", error);
      showToast("Could not export JSON backup.", "error");
    }
  };

  return (
    <div className="app">
      {toast && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="hero-copy">
            <p className="eyebrow">Personal Anime Collection</p>
            <h1>Anime Tracker</h1>
            <p className="subtitle">
              Track your anime collection, organize your watchlist, and manage your progress.
            </p>
          </div>

          <aside className="summary-card">
            <div className="summary-header">
              <div>
                <p className="summary-eyebrow">Quick Overview</p>
                <h3>Collection Stats</h3>
              </div>
            </div>

            <div className="summary-body">
              <div className="summary-pie-wrapper">
                <div className="summary-pie" style={pieStyle}>
                  <div className="summary-pie-center">
                    <span className="summary-total-number">{stats.total}</span>
                    <span className="summary-total-label">Total</span>
                  </div>
                </div>
              </div>

              <div className="summary-list">
                <div className="summary-item">
                  <span className="summary-label">
                    <span className="summary-dot watching-dot"></span>
                    Watching
                  </span>
                  <strong>{stats.watching}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">
                    <span className="summary-dot completed-dot"></span>
                    Completed
                  </span>
                  <strong>{stats.completed}</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">
                    <span className="summary-dot planned-dot"></span>
                    Planned
                  </span>
                  <strong>{stats.planned}</strong>
                </div>

                <div className="summary-item total-row">
                  <span className="summary-label">Total Anime</span>
                  <strong>{stats.total}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </header>

      <main className="main-layout">
        <section>
          <AnimeForm onCreate={handleCreateAnime} />
        </section>

        <section className="content-area">
          <WatchingProgressTable
            animes={watchingAnimes}
            onUpdate={handleQuickUpdateAnime}
          />

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Collection</p>
                <h2>Anime Library</h2>
              </div>

              <button
                type="button"
                className="export-button"
                onClick={handleExportJson}
              >
                Export JSON
              </button>
            </div>

            <div className="filters-panel">
              <div className="filter-field search-field">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="WATCHING">Watching</option>
                  <option value="PLANNED">Planned</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="DROPPED">Dropped</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Genre</label>
                <select
                  value={genreFilter}
                  onChange={(event) => setGenreFilter(event.target.value)}
                >
                  <option value="ALL">All Genres</option>
                  {allGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Sort by</label>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="NONE">Default Order</option>
                  <option value="TITLE_ASC">Title A-Z</option>
                  <option value="YEAR_DESC">Year Newest</option>
                  <option value="YEAR_ASC">Year Oldest</option>
                  <option value="RATING_DESC">Rating High-Low</option>
                  <option value="RATING_ASC">Rating Low-High</option>
                </select>
              </div>

              <div className="filter-actions">
                <button
                  type="button"
                  className="clear-filters-button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {loading && <p>Loading animes...</p>}

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {!loading && !errorMessage && filteredAnimes.length === 0 && (
              <p className="empty-message">No anime found.</p>
            )}

            {!loading && !errorMessage && filteredAnimes.length > 0 && (
              <>
                <p className="results-count">
                  Showing {filteredAnimes.length} of {animes.length} anime
                </p>

                <div className="anime-gallery">
                  {filteredAnimes.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onView={openDetails}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      <AnimeModal
        anime={selectedAnime}
        mode={modalMode}
        onClose={closeModal}
        onChangeMode={setModalMode}
        onUpdate={handleUpdateAnime}
        onDelete={handleDeleteAnime}
        relatedAnimes={relatedAnimes}
        onOpenRelated={openRelatedAnime}
      />
    </div>
  );
}

export default App;