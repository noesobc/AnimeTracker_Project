package com.animetracker.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "animes")
public class Anime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 500)
    private String title;

    @Column(length = 500)
    private String franchise;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AnimeType type;

    @Min(1900)
    @Max(2100)
    @Column(name = "release_year")
    private Integer year;

    @Column(length = 500)
    private String genre;

    @Min(0)
    private Integer episodes;

    @Min(0)
    private Integer watchedEpisodes;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AnimeStatus status;

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double rating;

    private Boolean seen;

    private Boolean reWatching;

    @Column(length = 1500)
    private String imageUrl;

    @Column(length = 3000)
    private String description;

    public Anime() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getFranchise() {
        return franchise;
    }

    public void setFranchise(String franchise) {
        this.franchise = franchise;
    }

    public AnimeType getType() {
        return type;
    }

    public Integer getYear() {
        return year;
    }

    public String getGenre() {
        return genre;
    }

    public Integer getEpisodes() {
        return episodes;
    }

    public Integer getWatchedEpisodes() {
        return watchedEpisodes;
    }

    public AnimeStatus getStatus() {
        return status;
    }

    public Double getRating() {
        return rating;
    }

    public Boolean getSeen() {
        return seen;
    }

    public Boolean getReWatching() {
        return reWatching;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setType(AnimeType type) {
        this.type = type;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public void setEpisodes(Integer episodes) {
        this.episodes = episodes;
    }

    public void setWatchedEpisodes(Integer watchedEpisodes) {
        this.watchedEpisodes = watchedEpisodes;
    }

    public void setStatus(AnimeStatus status) {
        this.status = status;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setSeen(Boolean seen) {
        this.seen = seen;
    }

    public void setReWatching(Boolean reWatching) {
        this.reWatching = reWatching;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
