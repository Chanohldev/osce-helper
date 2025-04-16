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

  async validateAndRefreshToken(): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || !user.token || !user.refreshToken) {
      return false;
    }

    try {
      // Verificar si el token ha expirado
      const tokenData = JSON.parse(atob(user.token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      
      // Si el token no ha expirado, no es necesario renovarlo
      if (currentTime < expirationTime) {
        return true;
      }
      
      // Si el token ha expirado, intentar renovarlo
      return await this.refreshToken();
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || !user.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Error refreshing token");
      }

      const res = await response.json();
      if (res.status !== 'success') {
        throw new Error("Failed to refresh token");
      }

      // Actualizar el token en el usuario actual
      if (this.currentUser) {
        this.currentUser.token = res.data.accessToken;
        this.currentUser.refreshToken = res.data.refreshToken;
        
        // Actualizar en localStorage
        localStorage.setItem("auth_token", res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(this.currentUser));
      }

      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Si hay un error al renovar el token, cerrar sesión
      this.logout();
      return false;
    }
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
