import api from './client';

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const usersApi = {
  list() {
    return api.get<UserSummary[]>('/users');
  },
};
