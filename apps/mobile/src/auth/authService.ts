export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

export class AuthService {
  private currentUser: AuthUser | null = null;
  private token: string | null = null;

  public async login(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    if (!credentials.email.trim()) {
      return {
        success: false,
        message: "Email is required.",
      };
    }

    if (!credentials.password) {
      return {
        success: false,
        message: "Password is required.",
      };
    }

    const user: AuthUser = {
      id: this.generateId(),
      name: credentials.email.split("@")[0],
      email: credentials.email,
    };

    const token = this.generateToken();

    this.currentUser = user;
    this.token = token;

    return {
      success: true,
      user,
      token,
      message: "Login successful.",
    };
  }

  public logout(): void {
    this.currentUser = null;
    this.token = null;
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null &&
      this.token !== null;
  }

  public async validateToken(
    token: string
  ): Promise<boolean> {
    return (
      this.token !== null &&
      token === this.token
    );
  }

  private generateToken(): string {
    return (
      "token_" +
      Date.now().toString(36) +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const authService = new AuthService();

export default authService;