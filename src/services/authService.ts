import { API_URL, API_KEY } from "../config/api.config";

export interface User {
  id: number;
  email: string;
  name: string;
  token?: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResponse> {

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Error en el login");
    }

    const res = await response.json();
    if (res.status !== 'success') {
      throw new Error("Invalid email or password");
    }

    // Store user data
    this.currentUser = {
      id: res.data.user.id,
      email: res.data.user.email,
      name: res.data.user.name,
      token: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    };

    // Store token in localStorage
    localStorage.setItem("auth_token", res.data.token);
    localStorage.setItem("user", JSON.stringify(this.currentUser));

    return {
      user: this.currentUser,
      token: res.data.token,
    };
  }

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      // Decodificar el token JWT para obtener la información del usuario
      const decodedToken = JSON.parse(atob(credential.split(".")[1]));

      // Crear un usuario con la información de Google
      const googleUser = {
        id: Date.now(), // Generar un ID único
        email: decodedToken.email,
        name: decodedToken.name,
      };

      // Store user data
      this.currentUser = googleUser;

      // Store token in localStorage
      localStorage.setItem("auth_token", credential);
      localStorage.setItem("user", JSON.stringify(this.currentUser));

      return {
        user: this.currentUser,
        token: credential,
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Failed to process Google login");
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<boolean> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error("Error en el registro");
    }

    return await response.json();
  }
}

export const authService = AuthService.getInstance();
