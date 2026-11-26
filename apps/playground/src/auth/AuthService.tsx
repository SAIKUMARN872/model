export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

class AuthService {
  public user: AuthUser | null;
  public token: string | null;

  constructor() {
    this.user = null;
    this.token = null;
  }

  async login(
    email: string,
    password: string
  ): Promise<AuthResult> {
    if (!email || !password) {
      throw new Error(
        "Email and password are required."
      );
    }

    const user: AuthUser = {
      id: "1",
      name: "User",
      email,
      role: "user",
    };

    const token = "demo-auth-token";

    this.user = user;
    this.token = token;

    return {
      user,
      token,
    };
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> {
    if (!name || !email || !password) {
      throw new Error(
        "Name, email and password are required."
      );
    }

    const user: AuthUser = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
    };

    const token = "demo-auth-token";

    this.user = user;
    this.token = token;

    return {
      user,
      token,
    };
  }

  logout(): void {
    this.user = null;
    this.token = null;
  }

  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return (
      this.user !== null &&
      this.token !== null
    );
  }
}

const authService = new AuthService();

export default authService;