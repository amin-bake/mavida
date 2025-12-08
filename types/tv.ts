/**
 * TV Show Type Definitions
 *
 * Comprehensive TypeScript interfaces for TV shows, seasons, and episodes
 * from TMDB API responses.
 */

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
  credit_id: string;
}

export interface CrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  department: string;
  job: string;
  credit_id: string;
}

export interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
  order: number;
  credit_id: string;
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: CastMember[];
}

export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes?: TVEpisode[];
}

export type TVShowStatus =
  | 'Returning Series'
  | 'Planned'
  | 'In Production'
  | 'Ended'
  | 'Canceled'
  | 'Pilot';

export type TVShowType =
  | 'Documentary'
  | 'News'
  | 'Miniseries'
  | 'Reality'
  | 'Scripted'
  | 'Talk Show'
  | 'Video';

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  original_language: string;

  // TV-specific fields
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TVSeason[];
  episode_run_time: number[];
  genres: Genre[];
  status: TVShowStatus;
  type: TVShowType;
  networks: Network[];
  created_by: Creator[];

  // Additional metadata
  homepage?: string;
  in_production: boolean;
  languages: string[];
  tagline?: string;
}

// API Response Types
export interface TVShowSearchResult {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

/**
 * TVShowsPage - Transformed paginated response with renamed fields
 * Similar to MoviesPage but for TV shows
 */
export interface TVShowsPage {
  page: number;
  tvShows: TVShow[];
  totalPages: number;
  totalResults: number;
}

export interface TVSeasonDetail extends TVSeason {
  episodes: TVEpisode[];
  _id: string;
}

export interface TVEpisodeDetail extends TVEpisode {
  production_code: string;
  show_id: number;
}
