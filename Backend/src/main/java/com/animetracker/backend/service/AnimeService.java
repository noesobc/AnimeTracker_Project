package com.animetracker.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.animetracker.backend.entity.Anime;
import com.animetracker.backend.repository.AnimeRepository;

import java.util.List;

@Service
public class AnimeService {

    private final AnimeRepository animeRepository;

    public AnimeService(AnimeRepository animeRepository) {
        this.animeRepository = animeRepository;
    }

    public List<Anime> getAllAnimes() {
        return animeRepository.findAll();
    }

    public Anime getAnimeById(Long id) {
        return animeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime not found"));
    }

    public Anime createAnime(Anime anime) {
        validateProgress(anime);
        return animeRepository.save(anime);
    }

    public Anime updateAnime(Long id, Anime updatedAnime) {
        Anime existingAnime = getAnimeById(id);

        existingAnime.setTitle(updatedAnime.getTitle());
        existingAnime.setFranchise(updatedAnime.getFranchise());
        existingAnime.setType(updatedAnime.getType());
        existingAnime.setYear(updatedAnime.getYear());
        existingAnime.setGenre(updatedAnime.getGenre());
        existingAnime.setEpisodes(updatedAnime.getEpisodes());
        existingAnime.setWatchedEpisodes(updatedAnime.getWatchedEpisodes());
        existingAnime.setStatus(updatedAnime.getStatus());
        existingAnime.setRating(updatedAnime.getRating());
        existingAnime.setSeen(updatedAnime.getSeen());
        existingAnime.setReWatching(updatedAnime.getReWatching());
        existingAnime.setImageUrl(updatedAnime.getImageUrl());
        existingAnime.setDescription(updatedAnime.getDescription());

        validateProgress(existingAnime);

        return animeRepository.save(existingAnime);
    }

    public void deleteAnime(Long id) {
        Anime anime = getAnimeById(id);
        animeRepository.delete(anime);
    }

    private void validateProgress(Anime anime) {
        if (anime.getEpisodes() != null && anime.getWatchedEpisodes() != null) {
            if (anime.getWatchedEpisodes() > anime.getEpisodes()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Watched episodes cannot be greater than total episodes"
                );
            }
        }
    }
}