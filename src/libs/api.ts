const API_URL = process.env.NEXT_PUBLIC_HW_API_URL!;

// ── helpers ──────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hw_token');
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────

export interface UsuarioSession {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'subadmin' | 'cliente';
  empresa?: string;
  telefono?: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: UsuarioSession;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutApi() {
  localStorage.removeItem('hw_token');
  localStorage.removeItem('hw_usuario');
}

export function getUsuarioGuardado(): UsuarioSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('hw_usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioSession;
  } catch {
    return null;
  }
}

// ── Proyectos ────────────────────────────────────────────────────

export function getMisProyectos() {
  return apiFetch<any[]>('/proyectos/mis-proyectos');
}

export function getProyectosComoEncargado() {
  return apiFetch<any[]>('/proyectos/mis-encargados');
}

export function getProyecto(id: string) {
  return apiFetch<any>(`/proyectos/${id}`);
}

// ── Implementaciones / Kanban ─────────────────────────────────────

export function getImplementacionesByProyecto(proyectoId: string) {
  return apiFetch<any[]>(`/implementaciones/proyecto/${proyectoId}`);
}

export function crearImplementacion(data: {
  nombre: string;
  descripcion?: string;
  tipo?: string;
  proyectoId: string;
}) {
  return apiFetch<any>('/implementaciones', { method: 'POST', body: JSON.stringify(data) });
}

export function eliminarImplementacion(id: string) {
  return apiFetch<void>(`/implementaciones/${id}`, { method: 'DELETE' });
}

export function crearTarea(data: {
  titulo: string;
  descripcion?: string;
  columna?: string;
  prioridad?: string;
  fechaLimite?: string;
  implementacionId: string;
}) {
  return apiFetch<any>('/implementaciones/tareas', { method: 'POST', body: JSON.stringify(data) });
}

export function moverTarea(id: string, columna: string) {
  return apiFetch<any>(`/implementaciones/tareas/${id}/mover`, { method: 'PATCH', body: JSON.stringify({ columna }) });
}

export function eliminarTarea(id: string) {
  return apiFetch<void>(`/implementaciones/tareas/${id}`, { method: 'DELETE' });
}

// ── Facturas ─────────────────────────────────────────────────────

export function getMisFacturas() {
  return apiFetch<any[]>('/facturas/mis-facturas');
}

// ── Tickets ──────────────────────────────────────────────────────

export function getMisTickets() {
  return apiFetch<any[]>('/tickets/mis-tickets');
}

export function crearTicket(data: { titulo: string; descripcion: string; prioridad?: string }) {
  return apiFetch<any>('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

// ── Reuniones ─────────────────────────────────────────────────────

export function getMisReuniones() {
  return apiFetch<any[]>('/reuniones/mis-reuniones');
}

// ── Documentos ───────────────────────────────────────────────────

export function getMisDocumentos() {
  return apiFetch<any[]>('/documentos/mis-documentos');
}

// ── Perfil ────────────────────────────────────────────────────────

export function getPerfil() {
  return apiFetch<UsuarioSession>('/auth/perfil');
}

// ── Admin: Clientes ───────────────────────────────────────────────

export function getClientes() {
  return apiFetch<UsuarioSession[]>('/usuarios');
}

export function crearCliente(data: {
  nombre: string;
  email: string;
  password: string;
  empresa?: string;
  telefono?: string;
}) {
  return apiFetch<UsuarioSession>('/usuarios', { method: 'POST', body: JSON.stringify(data) });
}

export function getCliente(id: string) {
  return apiFetch<UsuarioSession>(`/usuarios/${id}`);
}

export function toggleClienteActivo(id: string, activo: boolean) {
  return apiFetch<UsuarioSession>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify({ activo }) });
}

export function getProyectosPorCliente(clienteId: string) {
  return apiFetch<any[]>(`/proyectos/por-cliente/${clienteId}`);
}

// ── Admin: Proyectos (todos) ──────────────────────────────────────

export function getAdminProyectos() {
  return apiFetch<any[]>('/proyectos');
}

export function crearProyecto(data: {
  nombre: string;
  descripcion?: string;
  clienteId: string;
  fechaEntrega?: string;
  encargadosIds?: string[];
}) {
  return apiFetch<any>('/proyectos', { method: 'POST', body: JSON.stringify(data) });
}

// ── Admin: Tickets (todos) ───────────────────────────────────────

export function getAdminTickets() {
  return apiFetch<any[]>('/tickets');
}

export function responderTicket(id: string, respuesta: string) {
  return apiFetch<any>(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ respuesta, estado: 'respondido' }) });
}

// ── Admin: Reuniones (todas) ─────────────────────────────────────

export function getAdminReuniones() {
  return apiFetch<any[]>('/reuniones');
}

export function crearReunion(data: {
  titulo: string;
  tipo: string;
  fecha: string;
  duracionMinutos?: number;
  linkMeet?: string;
  clienteId: string;
}) {
  return apiFetch<any>('/reuniones', { method: 'POST', body: JSON.stringify(data) });
}

// ── Admin: Facturas (todas) ──────────────────────────────────────

export function getAdminFacturas() {
  return apiFetch<any[]>('/facturas');
}

// ── Admin: Documentos (todos) ────────────────────────────────────

export function getAdminDocumentos() {
  return apiFetch<any[]>('/documentos');
}
