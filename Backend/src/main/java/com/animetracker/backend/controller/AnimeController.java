package com.animetracker.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.animetracker.backend.entity.Anime;
import com.animetracker.backend.service.AnimeService;

import java.util.List;

@RestController
@RequestMapping("/api/animes")
@CrossOrigin(origins = "http://localhost:5173")
public class AnimeController {

    private final AnimeService animeService;

    public AnimeController(AnimeService animeService) {
        this.animeService = animeService;
    }

    @GetMapping
    public List<Anime> getAllAnimes() {
        return animeService.getAllAnimes();
    }

    @GetMapping("/{id}")
    public Anime getAnimeById(@PathVariable Long id) {
        return animeService.getAnimeById(id);
    }

    @PostMapping
    public ResponseEntity<Anime> createAnime(@Valid @RequestBody Anime anime) {
        Anime createdAnime = animeService.createAnime(anime);
        return new ResponseEntity<>(createdAnime, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public Anime updateAnime(@PathVariable Long id, @Valid @RequestBody Anime anime) {
        return animeService.updateAnime(id, anime);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnime(@PathVariable Long id) {
        animeService.deleteAnime(id);
        return ResponseEntity.noContent().build();
    }
}