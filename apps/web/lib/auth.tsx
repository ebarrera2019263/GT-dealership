'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const CLAVE_ACCESS = 'cg_access';
const CLAVE_REFRESH = 'cg_refresh';

export interface Usuario {
  id: number;
  email: string;
  rol: 'comprador' | 'vendedor' | 'concesionario' | 'admin';
  nombre?: string;
}

interface Credenciales {
  email: string;
  password: string;
}

interface RegistroDatos extends Credenciales {
  nombre: string;
  telefono?: string;
  rol: 'comprador' | 'vendedor' | 'concesionario';
}

interface AuthContexto {
  usuario: Usuario | null;
  cargando: boolean;
  login: (datos: Credenciales) => Promise<void>;
  registro: (datos: RegistroDatos) => Promise<void>;
  logout: () => Promise<void>;
  fetchAuth: (ruta: string, init?: RequestInit) => Promise<Response>;
}

const Contexto = createContext<AuthContexto | null>(null);

/** Decodifica el payload del JWT sin verificar firma (solo para pintar la UI;
 *  la autorización real la hace el API). */
function decodificar(token: string): Usuario | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub, email: payload.email, rol: payload.rol };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const tokens = useRef<{ access: string | null; refresh: string | null }>({
    access: null,
    refresh: null,
  });

  const guardar = useCallback((access: string, refresh: string) => {
    tokens.current = { access, refresh };
    localStorage.setItem(CLAVE_ACCESS, access);
    localStorage.setItem(CLAVE_REFRESH, refresh);
    setUsuario(decodificar(access));
  }, []);

  const limpiar = useCallback(() => {
    tokens.current = { access: null, refresh: null };
    localStorage.removeItem(CLAVE_ACCESS);
    localStorage.removeItem(CLAVE_REFRESH);
    setUsuario(null);
  }, []);

  // Rehidratar sesión al montar
  useEffect(() => {
    const access = localStorage.getItem(CLAVE_ACCESS);
    const refresh = localStorage.getItem(CLAVE_REFRESH);
    if (access && refresh) {
      tokens.current = { access, refresh };
      setUsuario(decodificar(access));
    }
    setCargando(false);
  }, []);

  const autenticar = useCallback(
    async (ruta: string, datos: unknown) => {
      const res = await fetch(`${API_URL}${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const cuerpo = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          cuerpo?.errores?.[0]?.detalle ?? cuerpo?.message ?? 'No se pudo autenticar',
        );
      }
      guardar(cuerpo.accessToken, cuerpo.refreshToken);
    },
    [guardar],
  );

  const login = useCallback(
    (datos: Credenciales) => autenticar('/auth/login', datos),
    [autenticar],
  );
  const registro = useCallback(
    (datos: RegistroDatos) => autenticar('/auth/registro', datos),
    [autenticar],
  );

  const logout = useCallback(async () => {
    const { refresh } = tokens.current;
    if (refresh) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      }).catch(() => undefined);
    }
    limpiar();
  }, [limpiar]);

  const refrescar = useCallback(async (): Promise<string | null> => {
    const { refresh } = tokens.current;
    if (!refresh) return null;
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) {
      limpiar();
      return null;
    }
    const cuerpo = await res.json();
    guardar(cuerpo.accessToken, cuerpo.refreshToken);
    return cuerpo.accessToken;
  }, [guardar, limpiar]);

  const fetchAuth = useCallback(
    async (ruta: string, init: RequestInit = {}): Promise<Response> => {
      const con = (token: string | null): RequestInit => ({
        ...init,
        headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      let res = await fetch(`${API_URL}${ruta}`, con(tokens.current.access));
      if (res.status === 401) {
        const nuevo = await refrescar();
        if (nuevo) {
          res = await fetch(`${API_URL}${ruta}`, con(nuevo));
        }
      }
      return res;
    },
    [refrescar],
  );

  const valor = useMemo<AuthContexto>(
    () => ({ usuario, cargando, login, registro, logout, fetchAuth }),
    [usuario, cargando, login, registro, logout, fetchAuth],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
