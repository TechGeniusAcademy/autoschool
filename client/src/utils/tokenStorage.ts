class TokenStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): any | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  static isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  static isInstructor(): boolean {
    const role = this.getUserRole();
    return role === 'instructor' || role === 'admin';
  }

  static isStudent(): boolean {
    return this.getUserRole() === 'student';
  }
}

export default TokenStorage;
