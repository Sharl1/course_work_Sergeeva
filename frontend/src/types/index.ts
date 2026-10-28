export interface User {
  UserID: number;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
  IsActive: boolean;
  roles: { RoleName: string }[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}