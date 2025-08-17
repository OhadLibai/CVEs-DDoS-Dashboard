// API Response Normalization Layer
class APIResponseNormalizer {
  constructor() {
    this.schemas = {
      nvd: this.getNVDSchema(),
      opencve: this.getOpenCVESchema(),
      cve: this.getCVESchema(),
      ipinfo: this.getIPInfoSchema(),
      mock: this.getMockSchema()
    };
  }

  // NVD API v2.0 Schema
  getNVDSchema() {
    return {
      vulnerabilities: {
        path: 'vulnerabilities',
        transform: (data) => data.map(vuln => ({
          id: vuln.cve?.id || 'Unknown',
          description: this.extractNVDDescription(vuln),
          publishedDate: vuln.cve?.published || null,
          lastModified: vuln.cve?.lastModified || null,
          cvssScore: this.extractNVDCVSS(vuln),
          cvssVector: this.extractNVDCVSSVector(vuln),
          cweIds: this.extractNVDCWEs(vuln),
          cpeConfigurations: this.extractNVDCPEs(vuln),
          references: this.extractNVDReferences(vuln),
          vendorProject: this.extractNVDVendor(vuln),
          source: 'nvd',
          rawData: vuln
        }))
      },
      totalResults: {
        path: 'totalResults',
        transform: (total) => parseInt(total) || 0
      },
      startIndex: {
        path: 'startIndex',
        transform: (index) => parseInt(index) || 0
      },
      resultsPerPage: {
        path: 'resultsPerPage',
        transform: (perPage) => parseInt(perPage) || 0
      }
    };
  }

  // OpenCVE Schema
  getOpenCVESchema() {
    return {
      vulnerabilities: {
        path: 'data',
        transform: (data) => data.map(vuln => ({
          id: vuln.id || 'Unknown',
          description: vuln.summary || '',
          publishedDate: vuln.published_date || null,
          lastModified: vuln.updated_date || null,
          cvssScore: vuln.cvss3 || vuln.cvss2 || null,
          cvssVector: vuln.cvss3_vector || vuln.cvss2_vector || null,
          cweIds: vuln.cwe ? [vuln.cwe] : [],
          cpeConfigurations: vuln.vendors || [],
          references: vuln.references || [],
          vendorProject: vuln.vendors?.[0] || 'Unknown',
          source: 'opencve',
          rawData: vuln
        }))
      },
      totalResults: {
        path: 'meta.total',
        transform: (total) => parseInt(total) || 0
      },
      startIndex: {
        path: 'meta.page',
        transform: (page) => ((parseInt(page) || 1) - 1) * 20 // Convert page to index
      },
      resultsPerPage: {
        path: 'meta.per_page',
        transform: (perPage) => parseInt(perPage) || 20
      }
    };
  }

  // CVE.org Schema
  getCVESchema() {
    return {
      vulnerabilities: {
        path: '',
        transform: (data) => [{
          id: data.cveMetadata?.cveId || 'Unknown',
          description: this.extractCVEOrgDescription(data),
          publishedDate: data.cveMetadata?.datePublished || null,
          lastModified: data.cveMetadata?.dateUpdated || null,
          cvssScore: null, // CVE.org doesn't provide CVSS
          cvssVector: null,
          cweIds: this.extractCVEOrgCWEs(data),
          cpeConfigurations: this.extractCVEOrgCPEs(data),
          references: data.containers?.cna?.references || [],
          vendorProject: this.extractCVEOrgVendor(data),
          source: 'cve.org',
          rawData: data
        }]
      },
      totalResults: { path: '', transform: () => 1 },
      startIndex: { path: '', transform: () => 0 },
      resultsPerPage: { path: '', transform: () => 1 }
    };
  }

  // IPInfo Schema
  getIPInfoSchema() {
    return {
      ip: { path: 'ip', transform: (ip) => ip || 'Unknown' },
      hostname: { path: 'hostname', transform: (hostname) => hostname || null },
      city: { path: 'city', transform: (city) => city || 'Unknown' },
      region: { path: 'region', transform: (region) => region || 'Unknown' },
      country: { path: 'country', transform: (country) => country || 'Unknown' },
      countryName: { path: 'country_name', transform: (name) => name || 'Unknown' },
      coordinates: {
        path: 'loc',
        transform: (loc) => {
          if (!loc) return { lat: null, lng: null };
          const [lat, lng] = loc.split(',');
          return { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
      },
      org: { path: 'org', transform: (org) => org || 'Unknown' },
      asn: {
        path: 'org',
        transform: (org) => {
          if (!org) return null;
          const asnMatch = org.match(/AS(\d+)/);
          return asnMatch ? `AS${asnMatch[1]}` : null;
        }
      },
      isp: { path: 'org', transform: (org) => org?.replace(/AS\d+\s*/, '') || 'Unknown' },
      timezone: { path: 'timezone', transform: (tz) => tz || null },
      source: { path: '', transform: () => 'ipinfo' }
    };
  }

  // Mock Data Schema (for compatibility)
  getMockSchema() {
    return {
      vulnerabilities: {
        path: 'ddosCVEs',
        transform: (data) => data.map(vuln => ({
          id: vuln.id,
          description: vuln.description,
          publishedDate: vuln.publishedDate,
          lastModified: vuln.publishedDate,
          cvssScore: vuln.cvssScore,
          cvssVector: null,
          cweIds: vuln.indicators?.cwes || [],
          cpeConfigurations: [],
          references: [],
          vendorProject: vuln.vendor || 'Unknown',
          confidence: vuln.confidence,
          attackType: vuln.attackType,
          industry: vuln.industry,
          protocol: vuln.protocol,
          source: 'mock',
          rawData: vuln
        }))
      },
      totalResults: {
        path: 'totalFound',
        transform: (total) => parseInt(total) || 0
      },
      startIndex: { path: '', transform: () => 0 },
      resultsPerPage: { path: '', transform: () => 50 }
    };
  }

  // Main normalization method
  normalize(response, sourceType) {
    const schema = this.schemas[sourceType];
    if (!schema) {
      console.warn(`No schema found for source type: ${sourceType}`);
      return response;
    }

    const normalized = {};

    // Apply transformations based on schema
    Object.entries(schema).forEach(([key, config]) => {
      const value = this.getValueByPath(response, config.path);
      normalized[key] = config.transform(value);
    });

    // Add metadata
    normalized.metadata = {
      sourceType,
      normalizedAt: Date.now(),
      originalKeys: Object.keys(response),
      hasData: normalized.vulnerabilities?.length > 0
    };

    return normalized;
  }

  // Utility method to get nested values
  getValueByPath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // NVD-specific extraction methods
  extractNVDDescription(vuln) {
    const descriptions = vuln.cve?.descriptions || [];
    const englishDesc = descriptions.find(desc => desc.lang === 'en');
    return englishDesc?.value || descriptions[0]?.value || 'No description available';
  }

  extractNVDCVSS(vuln) {
    const metrics = vuln.cve?.metrics || {};
    const cvssV31 = metrics.cvssMetricV31?.[0]?.cvssData;
    const cvssV30 = metrics.cvssMetricV30?.[0]?.cvssData;
    const cvssV2 = metrics.cvssMetricV2?.[0]?.cvssData;
    
    return cvssV31?.baseScore || cvssV30?.baseScore || cvssV2?.baseScore || null;
  }

  extractNVDCVSSVector(vuln) {
    const metrics = vuln.cve?.metrics || {};
    const cvssV31 = metrics.cvssMetricV31?.[0]?.cvssData;
    const cvssV30 = metrics.cvssMetricV30?.[0]?.cvssData;
    const cvssV2 = metrics.cvssMetricV2?.[0]?.cvssData;
    
    return cvssV31?.vectorString || cvssV30?.vectorString || cvssV2?.vectorString || null;
  }

  extractNVDCWEs(vuln) {
    const weaknesses = vuln.cve?.weaknesses || [];
    const cwes = [];
    
    weaknesses.forEach(weakness => {
      weakness.description?.forEach(desc => {
        if (desc.value && desc.value.startsWith('CWE-')) {
          cwes.push(desc.value);
        }
      });
    });
    
    return [...new Set(cwes)]; // Remove duplicates
  }

  extractNVDCPEs(vuln) {
    const configurations = vuln.cve?.configurations?.nodes || [];
    const cpes = [];
    
    configurations.forEach(node => {
      node.cpeMatch?.forEach(match => {
        if (match.criteria) {
          cpes.push({
            criteria: match.criteria,
            vulnerable: match.vulnerable,
            versionStartIncluding: match.versionStartIncluding,
            versionEndExcluding: match.versionEndExcluding
          });
        }
      });
    });
    
    return cpes;
  }

  extractNVDReferences(vuln) {
    const refs = vuln.cve?.references || [];
    return refs.map(ref => ({
      url: ref.url,
      source: ref.source,
      tags: ref.tags || []
    }));
  }

  extractNVDVendor(vuln) {
    const configurations = vuln.cve?.configurations?.nodes || [];
    const vendors = new Set();
    
    configurations.forEach(node => {
      node.cpeMatch?.forEach(match => {
        if (match.criteria) {
          const parts = match.criteria.split(':');
          if (parts.length > 3) {
            vendors.add(parts[3]); // Vendor is typically the 4th part in CPE
          }
        }
      });
    });
    
    return Array.from(vendors)[0] || 'Unknown';
  }

  // CVE.org specific extraction methods
  extractCVEOrgDescription(data) {
    const descriptions = data.containers?.cna?.descriptions || [];
    const englishDesc = descriptions.find(desc => desc.lang === 'en');
    return englishDesc?.value || descriptions[0]?.value || 'No description available';
  }

  extractCVEOrgCWEs(data) {
    const problemTypes = data.containers?.cna?.problemTypes || [];
    const cwes = [];
    
    problemTypes.forEach(problem => {
      problem.descriptions?.forEach(desc => {
        if (desc.cweId) {
          cwes.push(desc.cweId);
        }
      });
    });
    
    return [...new Set(cwes)];
  }

  extractCVEOrgCPEs(data) {
    const affected = data.containers?.cna?.affected || [];
    return affected.map(item => ({
      vendor: item.vendor,
      product: item.product,
      versions: item.versions
    }));
  }

  extractCVEOrgVendor(data) {
    const affected = data.containers?.cna?.affected || [];
    return affected[0]?.vendor || 'Unknown';
  }

  // Validation methods
  validateNormalizedResponse(normalized) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!normalized.vulnerabilities || !Array.isArray(normalized.vulnerabilities)) {
      errors.push('Missing or invalid vulnerabilities array');
    }

    if (typeof normalized.totalResults !== 'number') {
      warnings.push('totalResults is not a number');
    }

    // Validate vulnerability objects
    normalized.vulnerabilities?.forEach((vuln, index) => {
      if (!vuln.id) {
        errors.push(`Vulnerability at index ${index} missing ID`);
      }
      if (!vuln.description) {
        warnings.push(`Vulnerability ${vuln.id} missing description`);
      }
      if (!vuln.source) {
        warnings.push(`Vulnerability ${vuln.id} missing source`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Batch normalization for multiple responses
  normalizeBatch(responses) {
    return responses.map(response => {
      try {
        const normalized = this.normalize(response.data, response.sourceType);
        const validation = this.validateNormalizedResponse(normalized);
        
        return {
          ...normalized,
          validation,
          originalResponse: response
        };
      } catch (error) {
        return {
          error: error.message,
          sourceType: response.sourceType,
          originalResponse: response,
          metadata: {
            normalizedAt: Date.now(),
            hasData: false
          }
        };
      }
    });
  }

  // Get schema information for debugging
  getSchemaInfo(sourceType) {
    const schema = this.schemas[sourceType];
    if (!schema) return null;

    return {
      sourceType,
      fields: Object.keys(schema),
      paths: Object.values(schema).map(config => config.path),
      hasTransforms: Object.values(schema).every(config => typeof config.transform === 'function')
    };
  }

  // Register custom schema
  registerSchema(sourceType, schema) {
    this.schemas[sourceType] = schema;
    console.log(`Registered custom schema for: ${sourceType}`);
  }
}

// Response format adapter for different API structures
class ResponseFormatAdapter {
  constructor() {
    this.normalizer = new APIResponseNormalizer();
  }

  // Adapt any response to unified format
  adaptResponse(response, sourceType, originalParams = {}) {
    try {
      const normalized = this.normalizer.normalize(response, sourceType);
      
      return {
        vulnerabilities: normalized.vulnerabilities || [],
        pagination: {
          totalResults: normalized.totalResults || 0,
          startIndex: normalized.startIndex || 0,
          resultsPerPage: normalized.resultsPerPage || 50,
          currentPage: Math.floor((normalized.startIndex || 0) / (normalized.resultsPerPage || 50)),
          totalPages: Math.ceil((normalized.totalResults || 0) / (normalized.resultsPerPage || 50)),
          hasMore: (normalized.startIndex || 0) + (normalized.resultsPerPage || 50) < (normalized.totalResults || 0)
        },
        metadata: {
          ...normalized.metadata,
          requestParams: originalParams,
          processingTime: Date.now() - (originalParams.startTime || Date.now())
        }
      };
    } catch (error) {
      console.error('Response adaptation failed:', error);
      return {
        vulnerabilities: [],
        pagination: {
          totalResults: 0,
          startIndex: 0,
          resultsPerPage: 50,
          currentPage: 0,
          totalPages: 0,
          hasMore: false
        },
        metadata: {
          sourceType,
          normalizedAt: Date.now(),
          hasData: false,
          error: error.message
        }
      };
    }
  }

  // Merge responses from multiple sources
  mergeResponses(responses) {
    const allVulnerabilities = [];
    let totalResults = 0;
    const sources = new Set();
    const errors = [];

    responses.forEach(response => {
      if (response.vulnerabilities) {
        allVulnerabilities.push(...response.vulnerabilities);
        totalResults += response.pagination?.totalResults || 0;
        sources.add(response.metadata?.sourceType);
      }
      if (response.metadata?.error) {
        errors.push({
          source: response.metadata.sourceType,
          error: response.metadata.error
        });
      }
    });

    // Remove duplicates based on CVE ID
    const uniqueVulnerabilities = allVulnerabilities.filter((vuln, index, array) => 
      array.findIndex(v => v.id === vuln.id) === index
    );

    return {
      vulnerabilities: uniqueVulnerabilities,
      pagination: {
        totalResults: uniqueVulnerabilities.length,
        startIndex: 0,
        resultsPerPage: uniqueVulnerabilities.length,
        currentPage: 0,
        totalPages: 1,
        hasMore: false
      },
      metadata: {
        sources: Array.from(sources),
        mergedAt: Date.now(),
        totalSources: responses.length,
        hasData: uniqueVulnerabilities.length > 0,
        duplicatesRemoved: allVulnerabilities.length - uniqueVulnerabilities.length,
        errors
      }
    };
  }

  // Convert between pagination formats
  convertPagination(params, fromFormat, toFormat) {
    const converters = {
      'offset-limit': {
        'page-perpage': (params) => ({
          page: Math.floor((params.offset || 0) / (params.limit || 50)) + 1,
          per_page: params.limit || 50
        }),
        'start-rows': (params) => ({
          start: params.offset || 0,
          rows: params.limit || 50
        })
      },
      'page-perpage': {
        'offset-limit': (params) => ({
          offset: ((params.page || 1) - 1) * (params.per_page || 20),
          limit: params.per_page || 20
        }),
        'start-rows': (params) => ({
          start: ((params.page || 1) - 1) * (params.per_page || 20),
          rows: params.per_page || 20
        })
      }
    };

    const converter = converters[fromFormat]?.[toFormat];
    return converter ? { ...params, ...converter(params) } : params;
  }
}

// Export the classes
export { 
  APIResponseNormalizer, 
  ResponseFormatAdapter 
};