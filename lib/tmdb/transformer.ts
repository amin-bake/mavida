/**
 * TMDB Data Transformers
 * Converts TMDB API responses to application-specific types
 */

import type {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBCast,
  TMDBCrew,
  TMDBVideo,
  TMDBGenre,
  Movie,
  MovieDetail,
  Cast,
  Crew,
  Video,
} from '@/types/movie';

/**
 * Extract year from release date string
 */
function extractYear(dateString: string): number | null {
  if (!dateString) return null;
  const year = parseInt(dateString.split('-')[0], 10);
  return isNaN(year) ? null : year;
}

/**
 * Transform TMDB movie to application Movie type
 */
export function transformMovie(tmdbMovie: TMDBMovie, genres: TMDBGenre[] = []): Movie {
  // Build genre map for O(1) lookups (Rule 7.11: Use Set/Map for O(1) lookups)
  const genreMap = new Map(genres.map((g) => [g.id, g.name]));

  // Map genre IDs to names using the map
  const genreNames = tmdbMovie.genre_ids
    .map((id) => genreMap.get(id))
    .filter((name): name is string => name !== undefined);

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    originalTitle: tmdbMovie.original_title,
    overview: tmdbMovie.overview,
    posterPath: tmdbMovie.poster_path,
    backdropPath: tmdbMovie.backdrop_path,
    releaseDate: tmdbMovie.release_date,
    releaseYear: extractYear(tmdbMovie.release_date),
    genres: genreNames,
    rating: Math.round(tmdbMovie.vote_average * 10) / 10, // Round to 1 decimal
    voteCount: tmdbMovie.vote_count,
    popularity: tmdbMovie.popularity,
    isAdult: tmdbMovie.adult,
    language: tmdbMovie.original_language,
  };
}

/**
 * Transform TMDB movie detail to application MovieDetail type
 */
export function transformMovieDetail(
  tmdbDetail: TMDBMovieDetail,
  cast: TMDBCast[] = [],
  crew: TMDBCrew[] = [],
  videos: TMDBVideo[] = []
): MovieDetail {
  return {
    id: tmdbDetail.id,
    title: tmdbDetail.title,
    originalTitle: tmdbDetail.original_title,
    overview: tmdbDetail.overview,
    posterPath: tmdbDetail.poster_path,
    backdropPath: tmdbDetail.backdrop_path,
    releaseDate: tmdbDetail.release_date,
    releaseYear: extractYear(tmdbDetail.release_date),
    genres: tmdbDetail.genres.map((g) => g.name),
    rating: Math.round(tmdbDetail.vote_average * 10) / 10,
    voteCount: tmdbDetail.vote_count,
    popularity: tmdbDetail.popularity,
    isAdult: tmdbDetail.adult,
    language: tmdbDetail.original_language,
    runtime: tmdbDetail.runtime,
    budget: tmdbDetail.budget,
    revenue: tmdbDetail.revenue,
    status: tmdbDetail.status,
    tagline: tmdbDetail.tagline,
    homepage: tmdbDetail.homepage,
    imdbId: tmdbDetail.imdb_id,
    spokenLanguages: tmdbDetail.spoken_languages.map((l) => l.english_name),
    productionCompanies: tmdbDetail.production_companies.map((c) => c.name),
    productionCountries: tmdbDetail.production_countries.map((c) => c.name),
    collection: tmdbDetail.belongs_to_collection
      ? {
          id: tmdbDetail.belongs_to_collection.id,
          name: tmdbDetail.belongs_to_collection.name,
          posterPath: tmdbDetail.belongs_to_collection.poster_path,
          backdropPath: tmdbDetail.belongs_to_collection.backdrop_path,
        }
      : null,
    cast: transformCast(cast),
    crew: transformCrew(crew),
    videos: transformVideos(videos),
  };
}

/**
 * Transform TMDB cast array
 */
export function transformCast(cast: TMDBCast[]): Cast[] {
  return cast.map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character,
    profilePath: member.profile_path,
    order: member.order,
  }));
}

/**
 * Transform TMDB crew array
 */
export function transformCrew(crew: TMDBCrew[]): Crew[] {
  return crew.map((member) => ({
    id: member.id,
    name: member.name,
    job: member.job,
    department: member.department,
    profilePath: member.profile_path,
  }));
}

/**
 * Transform TMDB videos array
 */
export function transformVideos(videos: TMDBVideo[]): Video[] {
  return videos.map((video) => ({
    id: video.id,
    key: video.key,
    name: video.name,
    site: video.site,
    type: video.type,
    official: video.official,
    publishedAt: video.published_at,
  }));
}
