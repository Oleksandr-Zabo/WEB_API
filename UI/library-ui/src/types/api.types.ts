export interface ApiError {
  message: string;
  statusCode: number;
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
}

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}