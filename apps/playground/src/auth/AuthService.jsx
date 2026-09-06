class AuthService {
  constructor() {
    this.user = null;
    this.token = null;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error(
        "Email and password are required."
      );
    }

    const user = {
      id: "1",
      name: "User",
      email,
      role: "user",
    };

    const token =
      "demo-auth-token";

    this.user = user;
    this.token = token;

    return {
      user,
      token,
    };
  }

  async register(
    name,
    email,
    password
  ) {
    if (
      !name ||
      !email ||
      !password
    ) {
      throw new Error(
        "Name, email and password are required."
      );
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
    };

    const token =
      "demo-auth-token";

    this.user = user;
    this.token = token;

    return {
      user,
      token,
    };
  }

  logout() {
    this.user = null;
    this.token = null;
  }

  getCurrentUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return (
      this.user !== null &&
      this.token !== null
    );
  }
}

const authService =
  new AuthService();

export default authService;