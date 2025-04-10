// Mocked user data
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    name: 'Regular User'
  }
];

export interface User {
  id: number;
  email: string;
  name: string;
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create a mock token
    const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

    // Store user data
    this.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(this.currentUser));

    return {
      user: this.currentUser,
      token
    };
  }

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      // Decodificar el token JWT para obtener la información del usuario
      const decodedToken = JSON.parse(atob(credential.split('.')[1]));
      
      // Crear un usuario con la información de Google
      const googleUser = {
        id: Date.now(), // Generar un ID único
        email: decodedToken.email,
        name: decodedToken.name
      };
      
      // Store user data
      this.currentUser = googleUser;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', credential);
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      
      return {
        user: this.currentUser,
        token: credential
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Failed to process Google login');
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export const authService = AuthService.getInstance(); 