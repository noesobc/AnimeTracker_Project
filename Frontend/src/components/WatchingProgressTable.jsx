import { useState } from "react";

function WatchingProgressTable({ animes, onUpdate }) {
  const [editingEpisodes, setEditingEpisodes] = useState({});

  const getCurrentEpisode = (anime) => {
    if (editingEpisodes[anime.id] !== undefined) {
      return editingEpisodes[anime.id];
    }

    return anime.watchedEpisodes ?? 0;
  };

  const hasKnownTotalEpisodes = (anime) => {
    return anime.episodes !== null && anime.episodes !== undefined && anime.episodes > 0;
  };

  const handleEpisodeChange = (animeId, value) => {
    setEditingEpisodes({
      ...editingEpisodes,
      [animeId]: value
    });
  };

  const saveEpisodeProgress = async (anime) => {
    const newValue = Number(getCurrentEpisode(anime));

    if (newValue < 0) {
      alert("Watched episodes cannot be negative.");
      return;
    }

    if (hasKnownTotalEpisodes(anime) && newValue > anime.episodes) {
      alert("Watched episodes cannot be greater than total episodes.");
      return;
    }

    const updatedAnime = {
      ...anime,
      watchedEpisodes: newValue,
      seen: hasKnownTotalEpisodes(anime) ? newValue === anime.episodes : anime.seen
    };

    await onUpdate(anime.id, updatedAnime);

    const updatedEditingEpisodes = { ...editingEpisodes };
    delete updatedEditingEpisodes[anime.id];
    setEditingEpisodes(updatedEditingEpisodes);
  };

  const increaseEpisode = async (anime) => {
    const currentEpisode = anime.watchedEpisodes ?? 0;
    const nextEpisode = currentEpisode + 1;

    if (hasKnownTotalEpisodes(anime) && nextEpisode > anime.episodes) {
      alert("This anime is already at the last episode.");
      return;
    }

    const updatedAnime = {
      ...anime,
      watchedEpisodes: nextEpisode,
      seen: hasKnownTotalEpisodes(anime) ? nextEpisode === anime.episodes : anime.seen
    };

    await onUpdate(anime.id, updatedAnime);
  };

  const markAsCompleted = async (anime) => {
    const updatedAnime = {
      ...anime,
      watchedEpisodes: hasKnownTotalEpisodes(anime)
        ? anime.episodes
        : anime.watchedEpisodes,
      status: "COMPLETED",
      seen: true
    };

    await onUpdate(anime.id, updatedAnime);
  };

  if (animes.length === 0) {
    return (
      <section className="watching-panel">
        <div className="watching-header">
          <div>
            <p className="section-label">Currently Watching</p>
            <h2>Episode Tracker</h2>
          </div>

          <span className="watching-count">0 active</span>
        </div>

        <p className="empty-message">No anime currently marked as Watching.</p>
      </section>
    );
  }

  return (
    <section className="watching-panel">
      <div className="watching-header">
        <div>
          <p className="section-label">Currently Watching</p>
          <h2>Episode Tracker</h2>
        </div>

        <span className="watching-count">{animes.length} active</span>
      </div>

      <div className="watching-table-wrapper">
        <table className="watching-table">
          <thead>
            <tr>
              <th>Re-watching</th>
              <th>Seen</th>
              <th>Title</th>
              <th>Episode</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {animes.map((anime) => {
              const currentEpisode = getCurrentEpisode(anime);
              const knownTotal = hasKnownTotalEpisodes(anime);

              const progress = knownTotal
                ? Math.min(
                    Math.round(((anime.watchedEpisodes ?? 0) / anime.episodes) * 100),
                    100
                  )
                : null;

              return (
                <tr key={anime.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={anime.reWatching || false}
                      readOnly
                    />
                  </td>

                  <td>
                    <input
                      type="checkbox"
                      checked={anime.seen || false}
                      readOnly
                    />
                  </td>

                  <td className="watching-title-cell">
                    <span className="page-icon">▣</span>
                    {anime.title}
                  </td>

                  <td>
                    <div className="episode-control">
                      <input
                        type="number"
                        min="0"
                        max={knownTotal ? anime.episodes : undefined}
                        value={currentEpisode}
                        onChange={(event) =>
                          handleEpisodeChange(anime.id, event.target.value)
                        }
                      />

                      <span>
                        {knownTotal ? `/ ${anime.episodes}` : "episodes watched"}
                      </span>
                    </div>
                  </td>

                  <td>
                    {knownTotal ? (
                      <div className="mini-progress">
                        <div className="mini-progress-bar">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span>{progress}%</span>
                      </div>
                    ) : (
                      <span className="ongoing-label">Ongoing</span>
                    )}
                  </td>

                  <td>
                    <div className="watching-actions">
                      <button onClick={() => increaseEpisode(anime)}>+1</button>
                      <button onClick={() => saveEpisodeProgress(anime)}>Save</button>
                      <button onClick={() => markAsCompleted(anime)}>
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default WatchingProgressTable;