// Resilient API Call System with Failure Caching and Circuit Breaker
class ResilientAPICall {
  constructor(options = {}) {
    this.options = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterMax: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      failureCacheTimeout: 300000, // 5 minutes
      ...options
    };

    this.circuitBreakers = new Map();
    this.failureCache = new Map();
    this.requestStats = new Map();
  }

  // Main resilient call method
  async call(primaryAPI, fallbackAPIs = [], params = {}) {
    const allAPIs = [primaryAPI, ...fallbackAPIs];
    const callId = this.generateCallId(params);
    const startTime = Date.now();

    // Check if we have a recent failure cached
    const cachedFailure = this.getFailureFromCache(callId);
    if (cachedFailure && this.shouldSkipDueToCachedFailure(cachedFailure)) {
      throw new Error(`Skipping call due to recent failures: ${cachedFailure.lastError}`);
    }

    let lastError = null;
    let attemptedAPIs = [];

    for (let i = 0; i < allAPIs.length; i++) {
      const api = allAPIs[i];
      const apiKey = this.getAPIKey(api);

      try {
        // Check circuit breaker
        if (this.isCircuitBreakerOpen(apiKey)) {
          console.log(`Circuit breaker open for ${apiKey}, skipping`);
          attemptedAPIs.push({ api: apiKey, skipped: true, reason: 'Circuit breaker open' });
          continue;
        }

        // Attempt the API call
        const result = await this.callWithRetry(api, params, callId);
        
        // Success - update stats and clear failures
        this.recordSuccess(apiKey, Date.now() - startTime);
        this.clearFailureFromCache(callId);
        
        return {
          data: result,
          metadata: {
            primaryAPI: this.getAPIKey(primaryAPI),
            usedAPI: apiKey,
            attemptIndex: i,
            attemptedAPIs,
            responseTime: Date.now() - startTime,
            fromCache: result.fromCache || false
          }
        };

      } catch (error) {
        lastError = error;
        const responseTime = Date.now() - startTime;
        
        // Record failure
        this.recordFailure(apiKey, error, responseTime);
        attemptedAPIs.push({ 
          api: apiKey, 
          error: error.message, 
          responseTime,
          skipped: false 
        });

        console.warn(`API ${apiKey} failed:`, error.message);
      }
    }

    // All APIs failed - cache the failure
    this.cacheFailure(callId, {
      apis: attemptedAPIs,
      lastError: lastError?.message || 'Unknown error',
      timestamp: Date.now(),
      params
    });

    throw new Error(`All APIs failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  // Call with exponential backoff retry
  async callWithRetry(api, params, callId, attempt = 1) {
    try {
      const result = await this.executeAPICall(api, params);
      return result;
    } catch (error) {
      if (attempt >= this.options.maxRetries || !this.isRetryableError(error)) {
        throw error;
      }

      const delay = this.calculateBackoffDelay(attempt);
      console.log(`Retrying ${this.getAPIKey(api)} in ${delay}ms (attempt ${attempt + 1})`);
      
      await this.sleep(delay);
      return this.callWithRetry(api, params, callId, attempt + 1);
    }
  }

  // Execute the actual API call
  async executeAPICall(api, params) {
    if (typeof api === 'function') {
      return await api(params);
    } else if (api && typeof api.call === 'function') {
      return await api.call(params);
    } else if (api && api.method && api.url) {
      // HTTP-like API object
      const response = await fetch(api.url, {
        method: api.method || 'GET',
        headers: api.headers || {},
        body: api.method === 'POST' ? JSON.stringify(params) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } else {
      throw new Error('Invalid API format');
    }
  }

  // Check if error is retryable
  isRetryableError(error) {
    const retryableErrors = [
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'Network request failed',
      'fetch'
    ];

    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    
    return retryableErrors.some(retryable => 
      error.message.includes(retryable) || error.name === retryable
    ) || retryableStatusCodes.includes(error.status);
  }

  // Calculate exponential backoff delay with jitter
  calculateBackoffDelay(attempt) {
    const exponentialDelay = Math.min(
      this.options.baseDelay * Math.pow(this.options.backoffMultiplier, attempt - 1),
      this.options.maxDelay
    );
    
    const jitter = Math.random() * this.options.jitterMax;
    return exponentialDelay + jitter;
  }

  // Circuit breaker implementation
  isCircuitBreakerOpen(apiKey) {
    const breaker = this.circuitBreakers.get(apiKey);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      if (Date.now() - breaker.lastFailure > this.options.circuitBreakerTimeout) {
        // Move to half-open state
        breaker.state = 'half-open';
        console.log(`Circuit breaker for ${apiKey} moved to half-open`);
        return false;
      }
      return true;
    }

    return false;
  }

  // Record API success
  recordSuccess(apiKey, responseTime) {
    // Reset circuit breaker
    const breaker = this.circuitBreakers.get(apiKey);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
    }

    // Update stats
    const stats = this.requestStats.get(apiKey) || this.initializeStats();
    stats.successCount++;
    stats.totalResponseTime += responseTime;
    stats.avgResponseTime = stats.totalResponseTime / stats.successCount;
    stats.lastSuccess = Date.now();
    
    this.requestStats.set(apiKey, stats);
  }

  // Record API failure
  recordFailure(apiKey, error, responseTime) {
    // Update circuit breaker
    let breaker = this.circuitBreakers.get(apiKey);
    if (!breaker) {
      breaker = {
        failureCount: 0,
        state: 'closed',
        lastFailure: null
      };
      this.circuitBreakers.set(apiKey, breaker);
    }

    breaker.failureCount++;
    breaker.lastFailure = Date.now();

    if (breaker.failureCount >= this.options.circuitBreakerThreshold) {
      breaker.state = 'open';
      console.warn(`Circuit breaker opened for ${apiKey} after ${breaker.failureCount} failures`);
    }

    // Update stats
    const stats = this.requestStats.get(apiKey) || this.initializeStats();
    stats.failureCount++;
    stats.lastFailure = Date.now();
    stats.errors.push({
      message: error.message,
      timestamp: Date.now(),
      responseTime
    });

    // Keep only last 100 errors
    if (stats.errors.length > 100) {
      stats.errors = stats.errors.slice(-100);
    }

    this.requestStats.set(apiKey, stats);
  }

  // Initialize stats object
  initializeStats() {
    return {
      successCount: 0,
      failureCount: 0,
      totalResponseTime: 0,
      avgResponseTime: 0,
      lastSuccess: null,
      lastFailure: null,
      errors: []
    };
  }

  // Failure caching methods
  cacheFailure(callId, failureInfo) {
    this.failureCache.set(callId, {
      ...failureInfo,
      expiresAt: Date.now() + this.options.failureCacheTimeout
    });

    // Cleanup expired failures
    this.cleanupFailureCache();
  }

  getFailureFromCache(callId) {
    const failure = this.failureCache.get(callId);
    if (!failure) return null;

    if (Date.now() > failure.expiresAt) {
      this.failureCache.delete(callId);
      return null;
    }

    return failure;
  }

  clearFailureFromCache(callId) {
    this.failureCache.delete(callId);
  }

  shouldSkipDueToCachedFailure(cachedFailure) {
    const timeSinceFailure = Date.now() - cachedFailure.timestamp;
    const minRetryInterval = 60000; // 1 minute minimum

    return timeSinceFailure < minRetryInterval;
  }

  cleanupFailureCache() {
    const now = Date.now();
    for (const [callId, failure] of this.failureCache.entries()) {
      if (now > failure.expiresAt) {
        this.failureCache.delete(callId);
      }
    }
  }

  // Utility methods
  generateCallId(params) {
    const paramString = JSON.stringify(params);
    return btoa(paramString).replace(/[+/=]/g, '').substring(0, 16);
  }

  getAPIKey(api) {
    if (typeof api === 'function') {
      return api.name || 'anonymous_function';
    } else if (api && api.name) {
      return api.name;
    } else if (api && api.url) {
      return new URL(api.url).hostname;
    } else {
      return 'unknown_api';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check and monitoring
  getHealthStatus() {
    const now = Date.now();
    const health = {
      timestamp: now,
      apis: {},
      circuitBreakers: {},
      failureCache: {
        size: this.failureCache.size,
        entries: this.failureCache.size
      }
    };

    // API health status
    for (const [apiKey, stats] of this.requestStats.entries()) {
      const totalRequests = stats.successCount + stats.failureCount;
      const successRate = totalRequests > 0 ? (stats.successCount / totalRequests) * 100 : 0;
      
      health.apis[apiKey] = {
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(stats.avgResponseTime),
        totalRequests,
        successCount: stats.successCount,
        failureCount: stats.failureCount,
        lastSuccess: stats.lastSuccess,
        lastFailure: stats.lastFailure,
        status: this.getAPIHealthStatus(stats, now)
      };
    }

    // Circuit breaker status
    for (const [apiKey, breaker] of this.circuitBreakers.entries()) {
      health.circuitBreakers[apiKey] = {
        state: breaker.state,
        failureCount: breaker.failureCount,
        lastFailure: breaker.lastFailure,
        timeUntilHalfOpen: breaker.state === 'open' ? 
          Math.max(0, this.options.circuitBreakerTimeout - (now - breaker.lastFailure)) : 0
      };
    }

    return health;
  }

  getAPIHealthStatus(stats, now) {
    const timeSinceLastFailure = stats.lastFailure ? now - stats.lastFailure : Infinity;
    const timeSinceLastSuccess = stats.lastSuccess ? now - stats.lastSuccess : Infinity;
    
    if (stats.failureCount === 0) return 'healthy';
    if (timeSinceLastFailure < 60000) return 'unhealthy'; // Failed in last minute
    if (timeSinceLastSuccess < 300000) return 'recovering'; // Success in last 5 minutes
    if (stats.successCount === 0) return 'unknown';
    
    const successRate = stats.successCount / (stats.successCount + stats.failureCount);
    if (successRate > 0.95) return 'healthy';
    if (successRate > 0.8) return 'degraded';
    return 'unhealthy';
  }

  // Reset all circuit breakers (for testing/recovery)
  resetCircuitBreakers() {
    this.circuitBreakers.clear();
    console.log('All circuit breakers reset');
  }

  // Clear all failure cache
  clearFailureCache() {
    this.failureCache.clear();
    console.log('Failure cache cleared');
  }

  // Reset all stats
  resetStats() {
    this.requestStats.clear();
    this.circuitBreakers.clear();
    this.failureCache.clear();
    console.log('All API stats reset');
  }
}

// Enhanced API orchestrator with resilient calls
class EnhancedAPIOrchestrator {
  constructor(config = {}) {
    this.config = config;
    this.resilientCaller = new ResilientAPICall({
      maxRetries: config.maxRetries || 3,
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5
    });

    // Initialize API instances
    this.apis = this.initializeAPIs(config);
    this.fallbackChains = this.initializeFallbackChains();
  }

  initializeAPIs(config) {
    return {
      nvd: {
        name: 'nvd',
        call: async (params) => {
          const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?${new URLSearchParams(params)}`);
          if (!response.ok) throw new Error(`NVD API failed: ${response.status}`);
          return response.json();
        }
      },
      opencve: config.opencveApiKey ? {
        name: 'opencve',
        call: async (params) => {
          const response = await fetch(`https://www.opencve.io/api/cve?${new URLSearchParams(params)}`, {
            headers: { 'Authorization': `Bearer ${config.opencveApiKey}` }
          });
          if (!response.ok) throw new Error(`OpenCVE API failed: ${response.status}`);
          return response.json();
        }
      } : null,
      cve: {
        name: 'cve',
        call: async (params) => {
          if (!params.cveId) throw new Error('CVE ID required for CVE.org API');
          const response = await fetch(`https://cveawg.mitre.org/api/cve/${params.cveId}`);
          if (!response.ok) throw new Error(`CVE.org API failed: ${response.status}`);
          return response.json();
        }
      },
      ipinfo: {
        name: 'ipinfo',
        call: async (params) => {
          const apiKey = config.ipinfoApiKey ? `?token=${config.ipinfoApiKey}` : '';
          const response = await fetch(`https://ipinfo.io/${params.ip}${apiKey}`);
          if (!response.ok) throw new Error(`IPInfo API failed: ${response.status}`);
          return response.json();
        }
      },
      mock: {
        name: 'mock',
        call: async (params) => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
          
          // Simulate occasional failures
          if (Math.random() < 0.1) {
            throw new Error('Mock API simulated failure');
          }
          
          return this.generateMockResponse(params);
        }
      }
    };
  }

  initializeFallbackChains() {
    return {
      cveSearch: [
        this.apis.nvd,
        this.apis.opencve,
        this.apis.mock
      ].filter(Boolean),
      
      cveDetails: [
        this.apis.cve,
        this.apis.nvd,
        this.apis.mock
      ].filter(Boolean),
      
      ipLookup: [
        this.apis.ipinfo,
        this.apis.mock
      ].filter(Boolean)
    };
  }

  // Main search method with fallbacks
  async searchCVEs(params = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.resilientCaller.call(
        this.apis.nvd,
        this.fallbackChains.cveSearch.slice(1), // Exclude primary API from fallbacks
        params
      );

      return {
        ...result.data,
        metadata: {
          ...result.metadata,
          searchParams: params,
          totalTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('CVE search failed:', error);
      throw error;
    }
  }

  // Get CVE details with fallbacks
  async getCVEDetails(cveId) {
    try {
      const result = await this.resilientCaller.call(
        this.apis.cve,
        this.fallbackChains.cveDetails.slice(1),
        { cveId }
      );

      return {
        ...result.data,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('CVE details fetch failed:', error);
      throw error;
    }
  }

  // IP intelligence with fallbacks
  async getIPIntelligence(ip) {
    try {
      const result = await this.resilientCaller.call(
        this.apis.ipinfo,
        this.fallbackChains.ipLookup.slice(1),
        { ip }
      );

      return {
        ...result.data,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('IP lookup failed:', error);
      throw error;
    }
  }

  // Generate mock response for fallback
  generateMockResponse(params) {
    if (params.cveId) {
      return {
        cveMetadata: { cveId: params.cveId },
        containers: {
          cna: {
            descriptions: [{ lang: 'en', value: 'Mock CVE description for testing' }]
          }
        }
      };
    }

    if (params.ip) {
      return {
        ip: params.ip,
        city: 'Mock City',
        country: 'MC',
        org: 'AS12345 Mock ISP'
      };
    }

    // Default CVE search response
    return {
      vulnerabilities: Array.from({ length: Math.min(params.resultsPerPage || 20, 5) }, (_, i) => ({
        cve: {
          id: `CVE-2024-MOCK${String(i).padStart(3, '0')}`,
          descriptions: [{ 
            lang: 'en', 
            value: `Mock DDoS vulnerability ${i + 1} for testing purposes` 
          }],
          published: new Date().toISOString()
        }
      })),
      totalResults: 100,
      startIndex: params.startIndex || 0,
      resultsPerPage: params.resultsPerPage || 20
    };
  }

  // Health monitoring
  getSystemHealth() {
    return {
      timestamp: Date.now(),
      resilientCaller: this.resilientCaller.getHealthStatus(),
      apis: Object.keys(this.apis).filter(key => this.apis[key]),
      fallbackChains: Object.keys(this.fallbackChains)
    };
  }

  // Manually trigger circuit breaker reset
  resetCircuitBreakers() {
    this.resilientCaller.resetCircuitBreakers();
  }

  // Clear failure cache
  clearFailureCache() {
    this.resilientCaller.clearFailureCache();
  }
}

export { 
  ResilientAPICall, 
  EnhancedAPIOrchestrator 
};