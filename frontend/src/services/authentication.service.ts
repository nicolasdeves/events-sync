import { authApi } from "./axios.service";

const TOKEN_KEY = "jwt_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
  removeToken();
  localStorage.removeItem('userInfo');
  // Forçar reload para mostrar a tela de login
  window.location.href = '/';
}

export async function login(userInfo: {
  name: string;
  email: string;
  sub: string;
}) {
  try {
    const response: any = await authApi.post("/auth/login", {
      name: userInfo.name,
      email: userInfo.email,
      sub: userInfo.sub,
    });

    if (response.data && response.data.token) {
      setToken(response.data.token);
      return response.data.token;
    }

    throw new Error("Token não recebido do servidor");
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const response: any = await authApi.post("/auth/refresh");

    if (response.data && response.data.token) {
      setToken(response.data.token);
      return response.data.token;
    }

    return null;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    // Se o refresh falhar, fazer logout completo
    logout();
    return null;
  }
}

export function getUserInformations() {
  const localUserInfo = localStorage.getItem("userInfo");
  const userInfo = localUserInfo && JSON.parse(localUserInfo);

  return userInfo;
}
