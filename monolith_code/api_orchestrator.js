// Unified Rate Limiter
class UnifiedRateLimiter {
  constructor() {
    this.limits = {
      nvd: { limit: 50, window: 30000, requests: [], enabled: true },
      vulncheck: { limit: 100, window: 60000, requests: [], enabled: false },
      opencve: { limit: 1000, window: 3600000, requests: [], enabled: false },
      ipinfo: { limit: 50000, window: 2592000000, requests: [], enabled: true }, // Monthly limit
      cve: { limit: 100, window: 60000, requests: [], enabled: true },
      default: { limit: 10, window: 60000, requests: [], enabled: true }
    };
  }

  async checkLimit(service) {
    const config = this.limits[service] || this.limits.default;
    const now = Date.now();
    
    // Clean old requests outside window
    config.requests = config.requests.filter(time => now - time < config.window);
    
    if (config.requests.length >= config.limit) {
      const oldestRequest = Math.min(...config.requests);
      const waitTime = config.window - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`Rate limit reached for ${service}. Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit(service); // Recheck after waiting
      }
    }
    
    config.requests.push(now);
    return true;
  }

  async executeWithLimit(service, requestFn) {
    if (!this.limits[service]?.enabled) {
      throw new Error(`Service ${service} is not enabled`);
    }
    
    await this.checkLimit(service);
    return requestFn();
  }
}

// Enhanced Smart Cache
class SmartCache {
  constructor() {
    this.prefix = 'ddos_dashboard_v2_';
    this.priorities = {
      cve_metadata: 86400000,    // 24 hours
      threat_intel: 3600000,     // 1 hour  
      statistics: 1800000,       // 30 minutes
      correlation: 7200000,      // 2 hours
      asn_data: 604800000,       // 1 week (ASN data changes rarely)
      geolocation: 43200000,     // 12 hours
      frameworks: 86400000       // 24 hours
    };
  }

  set(key, data, category = 'default') {
    const maxAge = this.priorities[category] || 3600000; // Default 1 hour
    const item = {
      data,
      timestamp: Date.now(),
      maxAge,
      category,
      size: JSON.stringify(data).length
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch (retryError) {
          console.warn('Failed to cache data after cleanup:', retryError);
        }
      }
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > parsed.maxAge) {
        this.remove(key);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      this.remove(key);
      return null;
    }
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  cleanup() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    const items = keys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return { key, ...data };
      } catch {
        return { key, timestamp: 0, size: 0 };
      }
    });

    // Remove expired items first
    items.forEach(item => {
      if (Date.now() - item.timestamp > item.maxAge) {
        localStorage.removeItem(item.key);
      }
    });

    // If still over quota, remove largest items
    const remaining = items.filter(item => 
      Date.now() - item.timestamp <= item.maxAge
    ).sort((a, b) => b.size - a.size);

    while (remaining.length > 50) { // Keep max 50 items
      const item = remaining.pop();
      localStorage.removeItem(item.key);
    }
  }

  getCacheStats() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    const stats = {
      totalItems: keys.length,
      totalSize: 0,
      categories: {}
    };

    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        stats.totalSize += item.size || 0;
        stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
      } catch (error) {
        // Skip corrupted items
      }
    });

    return stats;
  }
}

// Base API Service
class BaseAPIService {
  constructor(baseUrl, serviceName, rateLimiter, cache) {
    this.baseUrl = baseUrl;
    this.serviceName = serviceName;
    this.rateLimiter = rateLimiter;
    this.cache = cache;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${this.serviceName}_${btoa(url + JSON.stringify(options))}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !options.skipCache) {
      return { data: cached, fromCache: true };
    }

    // Execute with rate limiting
    return this.rateLimiter.executeWithLimit(this.serviceName, async () => {
      return this.requestWithRetry(url, options, cacheKey);
    });
  }

  async requestWithRetry(url, options, cacheKey, attempt = 1) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DDoS-Analytics-Dashboard/1.0',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        if (response.status === 429 && attempt <= this.retryAttempts) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay * attempt;
          
          console.log(`Rate limited. Retrying after ${delay}ms (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.requestWithRetry(url, options, cacheKey, attempt + 1);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      const category = this.determineCacheCategory(url);
      this.cache.set(cacheKey, data, category);
      
      return { data, fromCache: false };
    } catch (error) {
      if (attempt <= this.retryAttempts && this.isRetryableError(error)) {
        console.log(`Request failed. Retrying... (attempt ${attempt})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.requestWithRetry(url, options, cacheKey, attempt + 1);
      }
      throw error;
    }
  }

  isRetryableError(error) {
    return error.name === 'TypeError' || // Network errors
           error.message.includes('fetch') ||
           error.message.includes('timeout');
  }

  determineCacheCategory(url) {
    if (url.includes('nvd.nist.gov')) return 'cve_metadata';
    if (url.includes('ipinfo.io')) return 'asn_data';
    if (url.includes('cve.org')) return 'cve_metadata';
    return 'default';
  }
}

// NVD API Service
class NVDService extends BaseAPIService {
  constructor(rateLimiter, cache, apiKey = null) {
    super('https://services.nvd.nist.gov/rest/json', 'nvd', rateLimiter, cache);
    this.apiKey = apiKey;
  }

  async searchCVEs(params = {}) {
    const queryParams = new URLSearchParams({
      resultsPerPage: Math.min(params.limit || 100, 2000),
      startIndex: params.offset || 0,
      ...params
    });

    const options = this.apiKey ? {
      headers: { 'apiKey': this.apiKey }
    } : {};

    const result = await this.makeRequest(`/cves/2.0?${queryParams}`, options);
    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'nvd'
    };
  }

  async getCVEById(cveId) {
    const result = await this.makeRequest(`/cves/2.0?cveId=${cveId}`);
    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'nvd'
    };
  }

  async searchProducts(params = {}) {
    const queryParams = new URLSearchParams({
      resultsPerPage: Math.min(params.limit || 100, 2000),
      startIndex: params.offset || 0,
      ...params
    });

    const result = await this.makeRequest(`/products/2.0?${queryParams}`);
    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'nvd'
    };
  }
}

// IPinfo Service for ASN/Geolocation
class IPInfoService extends BaseAPIService {
  constructor(rateLimiter, cache, apiKey = null) {
    super('https://ipinfo.io', 'ipinfo', rateLimiter, cache);
    this.apiKey = apiKey;
  }

  async getIPDetails(ip) {
    const endpoint = this.apiKey ? `/${ip}?token=${this.apiKey}` : `/${ip}`;
    const result = await this.makeRequest(endpoint);
    
    return {
      ip,
      ...result.data,
      fromCache: result.fromCache,
      source: 'ipinfo'
    };
  }

  async bulkLookup(ips) {
    if (!this.apiKey) {
      throw new Error('API key required for bulk operations');
    }

    const result = await this.makeRequest('/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ips)
    });

    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'ipinfo'
    };
  }
}

// CVE.org Service
class CVEService extends BaseAPIService {
  constructor(rateLimiter, cache) {
    super('https://cveawg.mitre.org/api', 'cve', rateLimiter, cache);
  }

  async getCVE(cveId) {
    const result = await this.makeRequest(`/cve/${cveId}`);
    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'cve.org'
    };
  }
}

// OpenCVE Service (when available)
class OpenCVEService extends BaseAPIService {
  constructor(rateLimiter, cache, apiKey = null) {
    super('https://www.opencve.io/api', 'opencve', rateLimiter, cache);
    this.apiKey = apiKey;
  }

  async searchCVEs(params = {}) {
    const queryParams = new URLSearchParams({
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      per_page: Math.min(params.limit || 20, 100),
      ...params
    });

    const options = this.apiKey ? {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    } : {};

    const result = await this.makeRequest(`/cve?${queryParams}`, options);
    return {
      ...result.data,
      fromCache: result.fromCache,
      source: 'opencve'
    };
  }
}

// Main API Orchestrator
class APIOrchestrator {
  constructor(config = {}) {
    this.rateLimiter = new UnifiedRateLimiter();
    this.cache = new SmartCache();
    
    // Initialize services
    this.services = {
      nvd: new NVDService(this.rateLimiter, this.cache, config.nvdApiKey),
      ipinfo: new IPInfoService(this.rateLimiter, this.cache, config.ipinfoApiKey),
      cve: new CVEService(this.rateLimiter, this.cache),
      opencve: config.opencveApiKey ? 
        new OpenCVEService(this.rateLimiter, this.cache, config.opencveApiKey) : null
    };

    this.fallbackChain = {
      cve_search: ['nvd', 'opencve', 'cve'].filter(s => this.services[s]),
      ip_lookup: ['ipinfo']
    };
  }

  async searchCVEs(params = {}) {
    const errors = [];
    
    for (const serviceName of this.fallbackChain.cve_search) {
      try {
        console.log(`Trying CVE search with ${serviceName}...`);
        const result = await this.services[serviceName].searchCVEs(params);
        return { ...result, primaryService: serviceName, errors };
      } catch (error) {
        console.warn(`${serviceName} failed:`, error.message);
        errors.push({ service: serviceName, error: error.message });
      }
    }
    
    throw new Error(`All CVE services failed: ${errors.map(e => e.error).join(', ')}`);
  }

  async getCVEDetails(cveId) {
    const errors = [];
    
    for (const serviceName of this.fallbackChain.cve_search) {
      try {
        const result = await this.services[serviceName].getCVEById 
          ? this.services[serviceName].getCVEById(cveId)
          : this.services[serviceName].getCVE(cveId);
        return { ...result, primaryService: serviceName, errors };
      } catch (error) {
        errors.push({ service: serviceName, error: error.message });
      }
    }
    
    throw new Error(`Failed to get CVE details: ${errors.map(e => e.error).join(', ')}`);
  }

  async getIPIntelligence(ip) {
    try {
      return await this.services.ipinfo.getIPDetails(ip);
    } catch (error) {
      console.warn('IP lookup failed:', error.message);
      return {
        ip,
        error: error.message,
        source: 'ipinfo'
      };
    }
  }

  async bulkIPLookup(ips) {
    try {
      return await this.services.ipinfo.bulkLookup(ips);
    } catch (error) {
      // Fallback to individual lookups
      console.log('Bulk lookup failed, falling back to individual requests');
      const results = {};
      
      for (const ip of ips) {
        try {
          results[ip] = await this.getIPIntelligence(ip);
        } catch (individualError) {
          results[ip] = { ip, error: individualError.message };
        }
      }
      
      return { results, fromCache: false, source: 'ipinfo_fallback' };
    }
  }

  // Service health and statistics
  getServiceStatus() {
    const status = {};
    
    Object.entries(this.services).forEach(([name, service]) => {
      if (service) {
        status[name] = {
          enabled: this.rateLimiter.limits[name]?.enabled || false,
          requests: this.rateLimiter.limits[name]?.requests.length || 0,
          limit: this.rateLimiter.limits[name]?.limit || 0
        };
      }
    });
    
    return {
      services: status,
      cache: this.cache.getCacheStats(),
      timestamp: Date.now()
    };
  }

  // Clear all caches
  clearCache() {
    this.cache.cleanup();
    console.log('Cache cleared');
  }

  // Enable/disable specific services
  toggleService(serviceName, enabled) {
    if (this.rateLimiter.limits[serviceName]) {
      this.rateLimiter.limits[serviceName].enabled = enabled;
      console.log(`Service ${serviceName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
}

export { 
  APIOrchestrator, 
  UnifiedRateLimiter, 
  SmartCache,
  NVDService,
  IPInfoService,
  CVEService,
  OpenCVEService
};