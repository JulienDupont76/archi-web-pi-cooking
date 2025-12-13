export interface Recipe {
  id: string;
  name: string; // Attention: "name" et non "title"
  description?: string;
  image_url?: string; // Le vrai nom du champ !
  instructions?: string;
  category?: string;
  published?: boolean;
  created_by?: string;
  created_at?: string;
  calories?: number;
  cost?: number;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  disclaimer?: string;
  when_to_eat?: string;
}

export interface User {
  id: string;
  username: string;
  token: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
