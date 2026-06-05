package com.animetracker.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.animetracker.backend.entity.Anime;

public interface AnimeRepository extends JpaRepository<Anime, Long> {
}