const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("senai_token");
}

function headers(isJson = true): HeadersInit {
  const token = getToken();
  return {
    ...(isJson && { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers(),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Erro ${response.status}`);
  }

  return data;
}

export const auth = {
  login: async (email: string, senha: string) => {
    const response = await request<{ success: boolean; token: string; usuario: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });

    if (response.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("senai_token", response.token);
      }
    }

    return response;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("senai_token");
    }
  },
};

export const alunos = {
  listar: (params?: { busca?: string; turma_id?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return request<{ success: boolean; total: number; data: any[] }>(`/alunos${query}`);
  },
};

export const professores = {
  listar: (busca?: string) => {
    const query = busca ? `?busca=${encodeURIComponent(busca)}` : "";
    return request<{ success: boolean; data: any[] }>(`/professores${query}`);
  },
  criar: (professor: { nome: string; cpf: string; rfid: string; telefone: string }) =>
    request("/professores", {
      method: "POST",
      body: JSON.stringify(professor),
    }),
  atualizar: (id: number, professor: { nome: string; cpf: string; rfid: string; telefone: string }) =>
    request(`/professores/${id}`, {
      method: "PUT",
      body: JSON.stringify(professor),
    }),
  remover: (id: number) =>
    request(`/professores/${id}`, {
      method: "DELETE",
    }),
};

export const turmas = {
  listar: () => request<{ success: boolean; data: any[] }>("/turmas"),
  criar: (nome: string) =>
    request("/turmas", {
      method: "POST",
      body: JSON.stringify({ nome }),
    }),
  atualizar: (id: number, nome: string) =>
    request(`/turmas/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nome }),
    }),
  remover: (id: number) =>
    request(`/turmas/${id}`, {
      method: "DELETE",
    }),
};

export const registros = {
  listar: () => request<{ success: boolean; data: any[] }>("/registros"),
  hoje: () => request<{ success: boolean; data: any[] }>("/registros/hoje"),
  stats: () => request<{ success: boolean; data: any }>("/registros/stats"),
};

const api = { auth, alunos, professores, turmas, registros };
export default api;
