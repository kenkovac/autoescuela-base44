
// Servicio API para conectar con el backend real con autenticación JWT
import AuthService from '../auth/AuthService';
import CacheService from './CacheService';

const API_BASE_URL = 'https://4qnumsjb8h.execute-api.us-east-1.amazonaws.com';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Verificar caché para peticiones GET
    if (options.method === 'GET' || !options.method) {
      const cacheKey = CacheService.generateKey(endpoint, options.params);
      const cachedData = CacheService.get(cacheKey);
      if (cachedData && !options.skipCache) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }
    
    // Para peticiones autenticadas, usar el método de AuthService
    if (options.requireAuth !== false) {
      try {
        const response = await AuthService.authenticatedRequest(url, options);
        
        // Guardar en caché solo las peticiones GET exitosas
        if ((options.method === 'GET' || !options.method) && response && !options.skipCache) {
          const cacheKey = CacheService.generateKey(endpoint, options.params);
          CacheService.set(cacheKey, response);
          console.log(`Cached response for ${endpoint}`);
        }
        
        return response;
      } catch (error) {
        console.error(`API Error for ${endpoint}:`, error);
        throw error;
      }
    }

    // Para peticiones públicas (como login)
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        return null; // It was an empty response
      }

      try {
        // Try to parse as JSON first
        const data = JSON.parse(responseText);
        console.log(`API response from ${endpoint}:`, data);
        
        // Guardar en caché peticiones GET exitosas
        if ((options.method === 'GET' || !options.method) && data && !options.skipCache) {
          const cacheKey = CacheService.generateKey(endpoint, options.params);
          CacheService.set(cacheKey, data);
        }
        
        return data;
      } catch (error) {
        // If it fails, return the raw text
        console.warn(`Public API returned a non-JSON success response for ${url}:`, responseText);
        return responseText;
      }
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }

  async post(endpoint, body) {
    // Invalidar caché relacionado después de POST
    const result = await this.request(endpoint, { method: 'POST', body });
    this.invalidateRelatedCache(endpoint);
    return result;
  }

  async put(endpoint, body) {
    // Invalidar caché relacionado después de PUT
    const result = await this.request(endpoint, { method: 'PUT', body });
    this.invalidateRelatedCache(endpoint);
    return result;
  }

  async patch(endpoint, body) {
    // Invalidar caché relacionado después de PATCH
    const result = await this.request(endpoint, { method: 'PATCH', body });
    this.invalidateRelatedCache(endpoint);
    return result;
  }

  async delete(endpoint) {
    // Invalidar caché relacionado después de DELETE
    const result = await this.request(endpoint, { method: 'DELETE' });
    this.invalidateRelatedCache(endpoint);
    return result;
  }

  // Invalidar caché relacionado basado en el endpoint
  invalidateRelatedCache(endpoint) {
    if (endpoint.includes('user')) {
      CacheService.invalidate('user');
    } else if (endpoint.includes('roles')) {
      CacheService.invalidate('roles');
    } else if (endpoint.includes('clientes')) {
      CacheService.invalidate('clientes');
    } else if (endpoint.includes('instructores')) {
      CacheService.invalidate('instructores');
    } else if (endpoint.includes('contratos')) {
      CacheService.invalidate('contratos');
      CacheService.invalidate('bloques-contrato');
      CacheService.invalidate('movimientos-contables');
    } else if (endpoint.includes('bloques-contrato')) {
      CacheService.invalidate('bloques-contrato');
    } else if (endpoint.includes('gestoria-ventas')) {
      CacheService.invalidate('gestoria-ventas');
      CacheService.invalidate('movimientos-contables');
    } else if (endpoint.includes('movimientos-contables')) {
      CacheService.invalidate('movimientos-contables');
    }
  }

  // Métodos específicos para Clientes
  async getClientes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/clientes?${query}`);
  }

  async getCliente(id) {
    return this.get(`/clientes/${id}`);
  }

  // Métodos específicos para Usuarios
  async getUsuarios(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/user?${query}`);
  }

  async getUsuario(id) {
    return this.get(`/user/${id}`);
  }

  async createUsuario(usuarioData) {
    return this.post('/user', usuarioData);
  }

  async updateUsuario(id, usuarioData) {
    return this.put(`/user/${id}`, usuarioData);
  }

  async deleteUsuario(id) {
    return this.delete(`/user/${id}`);
  }

  // Métodos específicos para Roles
  async getRoles(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/roles?${query}`);
  }

  async getRole(id) {
    return this.get(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.post('/roles', roleData);
  }

  async updateRole(id, roleData) {
    return this.put(`/roles/${id}`, roleData);
  }

  async deleteRole(id) {
    return this.delete(`/roles/${id}`);
  }

  async createCliente(clienteData) {
    return this.post('/clientes', clienteData);
  }

  async updateCliente(id, clienteData) {
    return this.put(`/clientes/${id}`, clienteData);
  }

  async deleteCliente(id) {
    return this.delete(`/clientes/${id}`);
  }

  // Métodos específicos para Instructores
  async getInstructores(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/instructores?${query}`);
  }

  async getInstructor(id) {
    return this.get(`/instructores/${id}`);
  }

  async createInstructor(instructorData) {
    return this.post('/instructores', instructorData);
  }

  async updateInstructor(id, instructorData) {
    return this.put(`/instructores/${id}`, instructorData);
  }

  async deleteInstructor(id) {
    return this.delete(`/instructores/${id}`);
  }

  async uploadInstructorPhoto(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the robust request method that can handle non-JSON responses
    const result = await this.request(`/instructores/upload-photo/${type}`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    
    // If the result is a string (non-JSON response), we need to handle it
    if (typeof result === 'string') {
      // Check if it's an error message or success message
      if (result.toLowerCase().includes('error') || result.startsWith('-')) {
        throw new Error(`Error uploading photo: ${result}`);
      }
      // If it's a success message, we might need to extract URL or handle differently
      // For now, throw an error asking for JSON response
      throw new Error(`API returned non-JSON response: ${result}. Expected JSON with 'url' field.`);
    }
    
    // If it's a proper JSON object, return it
    return result;
  }

  async removeInstructorPhoto(id, type) {
    return this.patch(`/instructores/${id}/remove-photo/${type}`);
  }

  // Métodos específicos para Contratos
  async getContratos(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/contratos?${query}`);
  }

  async getContrato(id) {
    return this.get(`/contratos/${id}`);
  }

  async createContrato(contratoData) {
    return this.post('/contratos', contratoData);
  }

  async updateContrato(id, contratoData) {
    return this.put(`/contratos/${id}`, contratoData);
  }

  async deleteContrato(id) {
    return this.delete(`/contratos/${id}`);
  }

  // Métodos específicos para Gestoría Ventas
  async getGestoriaVentas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/gestoria-ventas?${query}`);
  }

  async createGestoriaVenta(gestoriaData) {
    return this.post('/gestoria-ventas', gestoriaData);
  }

  // Nuevo método para automatizar la creación de movimientos contables junto con la gestoría de ventas
  async createGestoriaVentaWithAutomatedMovimiento(gestoriaData) {
    // Este método asume que hay un endpoint en el backend que maneja la lógica
    // de crear la gestoría de venta y automáticamente generar el movimiento contable asociado.
    // Esto evita la lógica de orquestación compleja en el frontend y asegura la atomicidad.
    return this.post('/gestoria-ventas/crear-con-movimiento', gestoriaData);
  }

  async updateGestoriaVenta(id, gestoriaData) {
    return this.put(`/gestoria-ventas/${id}`, gestoriaData);
  }

  async deleteGestoriaVenta(id) {
    return this.delete(`/gestoria-ventas/${id}`);
  }

  // Métodos específicos para Movimientos Contables
  async getMovimientosContables(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/movimientos-contables?${query}`);
  }

  async createMovimientoContable(movimientoData) {
    return this.post('/movimientos-contables', movimientoData);
  }

  async updateMovimientoContable(id, movimientoData) {
    return this.put(`/movimientos-contables/${id}`, movimientoData);
  }

  async deleteMovimientoContable(id) {
    return this.delete(`/movimientos-contables/${id}`);
  }

  // Métodos específicos para Horarios de Instructores
  async getHorariosInstructor(instructorId) {
    return this.get(`/horarios-instructores?instructor_id=${instructorId}`);
  }

  async createHorarioInstructor(horarioData) {
    return this.post('/horarios-instructores', horarioData);
  }

  async updateHorarioInstructor(id, horarioData) {
    return this.put(`/horarios-instructores/${id}`, horarioData);
  }

  async deleteHorarioInstructor(id) {
    return this.delete(`/horarios-instructores/${id}`);
  }

  // Métodos específicos para Bloques de Contrato
  async getBloquesContrato(contratoId) {
    return this.get(`/bloques-contrato?contrato_id=${contratoId}`);
  }

  async createBloqueContrato(bloqueData) {
    return this.post('/bloques-contrato', bloqueData);
  }

  async updateBloqueContrato(id, bloqueData) {
    return this.put(`/bloques-contrato/${id}`, bloqueData);
  }

  async deleteBloqueContrato(id) {
    return this.delete(`/bloques-contrato/${id}`);
  }

  // Método para subir archivos (fotos)
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload', {
      method: 'POST',
      headers: {}, // Dejar que el browser configure el Content-Type para FormData
      body: formData,
    });
  }

  // Método especial para obtener estadísticas del dashboard
  async getDashboardStats() {
    try {
      const now = new Date();
      // Start of current month (YYYY-MM-01)
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      // End of current month (YYYY-MM-DD, last day)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const [clientesRes, instructoresRes, contratosRes, gestoriaVentasRes, movimientosMesRes] = await Promise.all([
        this.getClientes({ limit: 10000, skipCache: true }),
        this.getInstructores({ limit: 10000, skipCache: true }),
        this.getContratos({ limit: 10000, skipCache: true }),
        this.getGestoriaVentas({ limit: 10000, skipCache: true }),
        this.getMovimientosContables({ 
            fecha_inicio: startDate, 
            fecha_fin: endDate, 
            tipo_movimiento: 'ingreso',
            limit: 10000,
            skipCache: true
        })
      ]);

      return {
        clientes: clientesRes.data || [],
        instructores: instructoresRes.data || [],
        contratos: contratosRes.data || [],
        gestoriaVentas: gestoriaVentasRes.data || [],
        movimientosMesActual: movimientosMesRes.data || []
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      throw error;
    }
  }
}

export default new ApiService();
