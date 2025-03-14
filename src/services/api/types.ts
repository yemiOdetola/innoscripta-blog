export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface NewsApiParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  source?: string;
  page?: number;
  pageSize?: number;
} 