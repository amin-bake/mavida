/**
 * TMDB API Response Types
 */

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  video: boolean;
}

export interface TMDBMovieDetail extends Omit<TMDBMovie, 'genre_ids'> {
  genres: TMDBGenre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  homepage: string | null;
  imdb_id: string | null;
  spoken_languages: TMDBSpokenLanguage[];
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  belongs_to_collection: TMDBCollection | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id: number;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  adult: boolean;
  popularity: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
  adult: boolean;
  popularity: number;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBMoviesResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse extends TMDBMoviesResponse {
  // Inherits all properties from TMDBMoviesResponse
}

/**
 * Application Movie Types
 * Transformed versions of TMDB types for internal use
 */

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  releaseYear: number | null;
  genres: string[];
  rating: number;
  voteCount: number;
  popularity: number;
  isAdult: boolean;
  language: string;

  // Properties for compatibility with unified media types
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  tagline: string | null;
  homepage: string | null;
  imdbId: string | null;
  spokenLanguages: string[];
  productionCompanies: string[];
  productionCountries: string[];
  collection: {
    id: number;
    name: string;
    posterPath: string | null;
    backdropPath: string | null;
  } | null;
  cast: Cast[];
  crew: Crew[];
  videos: Video[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  publishedAt: string;
}

export interface MoviesPage {
  page: number;
  movies: Movie[];
  totalPages: number;
  totalResults: number;
}

/**
 * API Error Types
 */

export interface TMDBErrorResponse {
  status_code: number;
  status_message: string;
  success: boolean;
}

export class TMDBError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public statusMessage: string
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

/**
 * Query Parameter Types
 */

export interface TMDBQueryParams {
  page?: number;
  language?: string;
  region?: string;
  include_adult?: boolean;
}

export interface TMDBSearchParams extends TMDBQueryParams {
  query: string;
  primary_release_year?: number;
  year?: number;
}

export interface TMDBDiscoverParams extends TMDBQueryParams {
  sort_by?: string;
  with_genres?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'release_date.gte'?: string;
  'release_date.lte'?: string;
}
