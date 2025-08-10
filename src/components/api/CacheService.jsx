class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutos por defecto
  }

  // Generar clave de caché basada en endpoint y parámetros
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }

  // Verificar si el caché es válido
  isCacheValid(key, customDuration = null) {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    
    const duration = customDuration || this.cacheDuration;
    return Date.now() - timestamp < duration;
  }

  // Obtener datos del caché
  get(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    // Si el caché expiró, limpiarlo
    this.cache.delete(key);
    this.cacheTimestamps.delete(key);
    return null;
  }

  // Guardar datos en el caché
  set(key, data, customDuration = null) {
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
    
    // Programar limpieza automática
    const duration = customDuration || this.cacheDuration;
    setTimeout(() => {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    }, duration);
  }

  // Limpiar caché específico
  invalidate(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    });
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Object.fromEntries(this.cache)).length
    };
  }
}

export default new CacheService();