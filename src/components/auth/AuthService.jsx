
// Servicio de autenticación JWT
class AuthService {
  constructor() {
    this.API_BASE_URL = 'https://4qnumsjb8h.execute-api.us-east-1.amazonaws.com';
    this.TOKEN_KEY = 'drivemaster_token';
    this.USER_KEY = 'drivemaster_user';
    this.isLoggingOut = false; // Flag para evitar múltiples llamadas a logout
  }

  // Hacer login y guardar token
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      const token = data.access_token || data.token;

      // Validación explícita del token
      if (!token) {
        throw new Error('Credenciales inválidas o respuesta inesperada del servidor.');
      }

      // Guardar token y datos del usuario
      localStorage.setItem(this.TOKEN_KEY, token);
      if (data.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Cerrar sesión
  logout() {
    if (this.isLoggingOut) return; // Prevenir múltiples ejecuciones
    this.isLoggingOut = true;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.reload(); // Recargar para limpiar estado
  }

  // Obtener token actual
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Verificar si está autenticado
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verificar si el token está expirado (JWT básico)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // Si no se puede decodificar, asumir que es válido por ahora
      return true;
    }
  }

  // Obtener datos del usuario actual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Hacer petición autenticada
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      this.logout();
      // Devolver una promesa pendiente para detener la ejecución y evitar errores.
      return new Promise(() => {});
    }

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    // CRITICAL FIX: Solo agregar Content-Type y convertir a JSON si NO es FormData
    if (!(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      // Convertir el cuerpo de la petición a JSON si es un objeto
      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expirado o inválido. Iniciar el proceso de logout.
        this.logout();
        // Devolver una promesa pendiente para evitar que se muestren errores al usuario.
        // La recarga de la página se encargará de mostrar el login.
        return new Promise(() => {});
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        return null; // Handle empty responses (like on a DELETE request)
      }

      try {
        // Try to parse as JSON first, as this is the expected format.
        return JSON.parse(responseText);
      } catch (e) {
        // If parsing fails, it's likely a plain text response like "ok".
        // Log a warning and return the raw text to prevent the app from crashing.
        console.warn(`API returned a non-JSON success response for ${url}:`, responseText);
        return responseText;
      }
      
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  // Registro de nuevo usuario (si tu API lo soporta)
  async register(userData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
}

export default new AuthService();
