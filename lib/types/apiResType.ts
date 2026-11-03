export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface MessageResponse {
  message: string;
}
