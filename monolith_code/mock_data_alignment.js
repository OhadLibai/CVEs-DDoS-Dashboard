// Mock Data Alignment System - Ensures mock data matches real API schemas
class MockDataAlignmentSystem {
  constructor() {
    this.schemas = this.initializeSchemas();
    this.generators = this.initializeGenerators();
    this.validator = new MockDataValidator();
  }

  initializeSchemas() {
    return {
      nvd: {
        response: {
          vulnerabilities: 'array',
          totalResults: 'number',
          startIndex: 'number',
          resultsPerPage: 'number'
        },
        vulnerability: {
          cve: {
            id: 'string',
            descriptions: 'array',
            published: 'iso_date',
            lastModified: 'iso_date',
            metrics: 'object',
            weaknesses: 'array',
            configurations: 'object',
            references: 'array'
          }
        }
      },
      opencve: {
        response: {
          data: 'array',
          meta: {
            total: 'number',
            page: 'number',
            per_page: 'number'
          }
        },
        vulnerability: {
          id: 'string',
          summary: 'string',
          published_date: 'iso_date',
          updated_date: 'iso_date',
          cvss3: 'number',
          cvss2: 'number',
          cvss3_vector: 'string',
          cwe: 'string',
          vendors: 'array',
          references: 'array'
        }
      },
      ipinfo: {
        response: {
          ip: 'string',
          hostname: 'string',
          city: 'string',
          region: 'string',
          country: 'string',
          country_name: 'string',
          loc: 'string', // "lat,lng"
          org: 'string',
          timezone: 'string'
        }
      }
    };
  }

  initializeGenerators() {
    return {
      // CVE ID generator
      cveId: () => `CVE-${2020 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      
      // Date generators
      recentDate: () => {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 365);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return date.toISOString();
      },
      
      // CVSS score generator
      cvssScore: () => +(Math.random() * 4 + 6).toFixed(1),
      
      // CWE generator for DDoS
      ddosCWE: () => {
        const ddosCWEs = ['CWE-400', 'CWE-770', 'CWE-834', 'CWE-672', 'CWE-730', 'CWE-920'];
        return ddosCWEs[Math.floor(Math.random() * ddosCWEs.length)];
      },
      
      // Vendor generator
      vendor: () => {
        const vendors = ['apache', 'microsoft', 'cisco', 'google', 'amazon', 'nginx', 'oracle', 'ibm'];
        return vendors[Math.floor(Math.random() * vendors.length)];
      },
      
      // Product generator
      product: () => {
        const products = ['http_server', 'web_server', 'router', 'firewall', 'load_balancer', 'dns_server'];
        return products[Math.floor(Math.random() * products.length)];
      },
      
      // IP address generator
      ipAddress: () => {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      },
      
      // Country generator
      country: () => {
        const countries = ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'JP', 'KR', 'IN', 'BR'];
        return countries[Math.floor(Math.random() * countries.length)];
      },
      
      // City generator
      city: () => {
        const cities = ['New York', 'London', 'Moscow', 'Beijing', 'Tokyo', 'Berlin', 'Paris', 'Seoul'];
        return cities[Math.floor(Math.random() * cities.length)];
      }
    };
  }

  // Generate NVD-compatible mock data
  generateNVDMockData(count = 50, params = {}) {
    const vulnerabilities = [];
    
    for (let i = 0; i < count; i++) {
      const cveId = this.generators.cveId();
      const publishedDate = this.generators.recentDate();
      const vendor = this.generators.vendor();
      const product = this.generators.product();
      
      const vulnerability = {
        cve: {
          id: cveId,
          sourceIdentifier: 'cve@mitre.org',
          published: publishedDate,
          lastModified: this.generators.recentDate(),
          vulnStatus: 'Published',
          descriptions: [
            {
              lang: 'en',
              value: this.generateDDoSDescription(vendor, product, cveId)
            }
          ],
          metrics: this.generateCVSSMetrics(),
          weaknesses: this.generateWeaknesses(),
          configurations: this.generateConfigurations(vendor, product),
          references: this.generateReferences()
        }
      };
      
      vulnerabilities.push(vulnerability);
    }
    
    return {
      vulnerabilities,
      totalResults: params.totalResults || Math.floor(count * (1.5 + Math.random())),
      startIndex: params.startIndex || 0,
      resultsPerPage: count,
      version: '2.0',
      timestamp: new Date().toISOString()
    };
  }

  // Generate OpenCVE-compatible mock data
  generateOpenCVEMockData(count = 20, params = {}) {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const cveId = this.generators.cveId();
      const vendor = this.generators.vendor();
      
      data.push({
        id: cveId,
        summary: this.generateDDoSDescription(vendor, this.generators.product(), cveId),
        published_date: this.generators.recentDate(),
        updated_date: this.generators.recentDate(),
        cvss3: this.generators.cvssScore(),
        cvss2: this.generators.cvssScore(),
        cvss3_vector: this.generateCVSSVector(),
        cwe: this.generators.ddosCWE(),
        vendors: [vendor],
        references: this.generateSimpleReferences()
      });
    }
    
    return {
      data,
      meta: {
        total: params.totalResults || Math.floor(count * (1.2 + Math.random())),
        page: Math.floor((params.startIndex || 0) / count) + 1,
        per_page: count
      }
    };
  }

  // Generate IPInfo-compatible mock data
  generateIPInfoMockData(ip) {
    const country = this.generators.country();
    const city = this.generators.city();
    const lat = (Math.random() - 0.5) * 180;
    const lng = (Math.random() - 0.5) * 360;
    const asn = Math.floor(Math.random() * 65535);
    
    return {
      ip: ip || this.generators.ipAddress(),
      hostname: `host-${Math.random().toString(36).substr(2, 8)}.example.com`,
      city,
      region: city + ' Region',
      country,
      country_name: this.getCountryName(country),
      loc: `${lat.toFixed(4)},${lng.toFixed(4)}`,
      org: `AS${asn} Mock ISP Provider`,
      postal: String(Math.floor(Math.random() * 99999)).padStart(5, '0'),
      timezone: this.getTimezone(country)
    };
  }

  // Generate realistic DDoS vulnerability descriptions
  generateDDoSDescription(vendor, product, cveId) {
    const ddosTypes = [
      'denial of service',
      'amplification attack',
      'resource exhaustion',
      'flooding attack',
      'bandwidth consumption',
      'connection exhaustion'
    ];
    
    const mechanisms = [
      'malformed packets',
      'excessive requests',
      'memory consumption',
      'CPU exhaustion',
      'network flooding',
      'protocol abuse'
    ];
    
    const impacts = [
      'causing service unavailability',
      'leading to system crash',
      'resulting in performance degradation',
      'enabling complete service disruption',
      'allowing remote denial of service'
    ];
    
    const ddosType = ddosTypes[Math.floor(Math.random() * ddosTypes.length)];
    const mechanism = mechanisms[Math.floor(Math.random() * mechanisms.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];
    
    return `${vendor} ${product} contains a vulnerability that allows remote attackers to cause a ${ddosType} via ${mechanism}, ${impact}. This vulnerability affects network availability and can be exploited to overwhelm system resources.`;
  }

  // Generate CVSS metrics that align with real NVD structure
  generateCVSSMetrics() {
    const baseScore = this.generators.cvssScore();
    const vectorString = this.generateCVSSVector();
    
    return {
      cvssMetricV31: [
        {
          source: 'nvd@nist.gov',
          type: 'Primary',
          cvssData: {
            version: '3.1',
            vectorString,
            baseScore,
            baseSeverity: this.getCVSSSeverity(baseScore),
            attackVector: 'NETWORK',
            attackComplexity: 'LOW',
            privilegesRequired: 'NONE',
            userInteraction: 'NONE',
            scope: 'UNCHANGED',
            confidentialityImpact: 'NONE',
            integrityImpact: 'NONE',
            availabilityImpact: 'HIGH'
          },
          exploitabilityScore: 3.9,
          impactScore: 3.6
        }
      ]
    };
  }

  // Generate CVSS vector string
  generateCVSSVector() {
    return 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H';
  }

  // Get CVSS severity rating
  getCVSSSeverity(score) {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
  }

  // Generate weakness information
  generateWeaknesses() {
    return [
      {
        source: 'nvd@nist.gov',
        type: 'Primary',
        description: [
          {
            lang: 'en',
            value: this.generators.ddosCWE()
          }
        ]
      }
    ];
  }

  // Generate configuration information
  generateConfigurations(vendor, product) {
    return {
      nodes: [
        {
          operator: 'OR',
          negate: false,
          cpeMatch: [
            {
              vulnerable: true,
              criteria: `cpe:2.3:a:${vendor}:${product}:*:*:*:*:*:*:*:*`,
              matchCriteriaId: this.generateUUID()
            }
          ]
        }
      ]
    };
  }

  // Generate references
  generateReferences() {
    const refTypes = ['Vendor Advisory', 'Third Party Advisory', 'Technical Description'];
    const domains = ['security.org', 'example-vendor.com', 'vuln-db.org', 'cert.org'];
    
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      url: `https://${domains[Math.floor(Math.random() * domains.length)]}/advisory/${Math.random().toString(36).substr(2, 8)}`,
      source: domains[Math.floor(Math.random() * domains.length)],
      tags: [refTypes[Math.floor(Math.random() * refTypes.length)]]
    }));
  }

  // Generate simple references for OpenCVE
  generateSimpleReferences() {
    return this.generateReferences().map(ref => ref.url);
  }

  // Utility methods
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getCountryName(countryCode) {
    const names = {
      'US': 'United States',
      'CN': 'China',
      'RU': 'Russia',
      'DE': 'Germany',
      'GB': 'United Kingdom',
      'FR': 'France',
      'JP': 'Japan',
      'KR': 'South Korea',
      'IN': 'India',
      'BR': 'Brazil'
    };
    return names[countryCode] || 'Unknown Country';
  }

  getTimezone(countryCode) {
    const timezones = {
      'US': 'America/New_York',
      'CN': 'Asia/Shanghai',
      'RU': 'Europe/Moscow',
      'DE': 'Europe/Berlin',
      'GB': 'Europe/London',
      'FR': 'Europe/Paris',
      'JP': 'Asia/Tokyo',
      'KR': 'Asia/Seoul',
      'IN': 'Asia/Kolkata',
      'BR': 'America/Sao_Paulo'
    };
    return timezones[countryCode] || 'UTC';
  }

  // Main alignment method - converts any mock data to match API format
  alignMockDataToAPI(sourceType, mockData) {
    switch (sourceType) {
      case 'nvd':
        return this.alignToNVDFormat(mockData);
      case 'opencve':
        return this.alignToOpenCVEFormat(mockData);
      case 'ipinfo':
        return this.alignToIPInfoFormat(mockData);
      default:
        console.warn(`Unknown source type for alignment: ${sourceType}`);
        return mockData;
    }
  }

  alignToNVDFormat(data) {
    // If data is already in correct format, return as-is
    if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
      return data;
    }

    // Convert from legacy format
    if (Array.isArray(data)) {
      return this.generateNVDMockData(data.length);
    }

    return this.generateNVDMockData();
  }

  alignToOpenCVEFormat(data) {
    if (data.data && Array.isArray(data.data)) {
      return data;
    }

    if (Array.isArray(data)) {
      return this.generateOpenCVEMockData(data.length);
    }

    return this.generateOpenCVEMockData();
  }

  alignToIPInfoFormat(data) {
    if (data.ip && data.country) {
      return data;
    }

    return this.generateIPInfoMockData(data.ip || null);
  }

  // Batch generation for performance testing
  generateBatchMockData(sourceType, count = 1000, chunkSize = 100) {
    const chunks = [];
    const totalChunks = Math.ceil(count / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const currentChunkSize = Math.min(chunkSize, count - i * chunkSize);
      const startIndex = i * chunkSize;

      let chunk;
      switch (sourceType) {
        case 'nvd':
          chunk = this.generateNVDMockData(currentChunkSize, { 
            startIndex, 
            totalResults: count 
          });
          break;
        case 'opencve':
          chunk = this.generateOpenCVEMockData(currentChunkSize, { 
            startIndex, 
            totalResults: count 
          });
          break;
        default:
          throw new Error(`Unsupported source type for batch generation: ${sourceType}`);
      }

      chunks.push(chunk);
    }

    return chunks;
  }

  // Validation and testing
  validateMockDataStructure(sourceType, data) {
    return this.validator.validate(sourceType, data, this.schemas[sourceType]);
  }
}

// Mock Data Validator
class MockDataValidator {
  validate(sourceType, data, schema) {
    const errors = [];
    const warnings = [];

    try {
      this.validateObject(data, schema.response, '', errors, warnings);
      
      // Validate vulnerability structures if present
      if (sourceType === 'nvd' && data.vulnerabilities) {
        data.vulnerabilities.forEach((vuln, index) => {
          this.validateObject(vuln, schema.vulnerability, `vulnerabilities[${index}]`, errors, warnings);
        });
      } else if (sourceType === 'opencve' && data.data) {
        data.data.forEach((vuln, index) => {
          this.validateObject(vuln, schema.vulnerability, `data[${index}]`, errors, warnings);
        });
      }

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sourceType,
      timestamp: Date.now()
    };
  }

  validateObject(obj, schema, path, errors, warnings) {
    Object.entries(schema).forEach(([key, expectedType]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj[key];

      if (value === undefined || value === null) {
        warnings.push(`Missing optional field: ${currentPath}`);
        return;
      }

      if (!this.validateType(value, expectedType)) {
        errors.push(`Type mismatch at ${currentPath}: expected ${expectedType}, got ${typeof value}`);
      }
    });
  }

  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'iso_date':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      default:
        if (typeof expectedType === 'object') {
          return typeof value === 'object';
        }
        return true;
    }
  }
}

// Mock Data Migration Tool
class MockDataMigrator {
  constructor(alignmentSystem) {
    this.alignment = alignmentSystem;
  }

  // Migrate old mock data to new API-aligned format
  migrateToAPIFormat(oldMockData, targetAPI = 'nvd') {
    console.log(`Migrating mock data to ${targetAPI} format...`);
    
    const migrated = this.alignment.alignMockDataToAPI(targetAPI, oldMockData);
    const validation = this.alignment.validateMockDataStructure(targetAPI, migrated);
    
    if (!validation.isValid) {
      console.warn('Migration produced invalid data:', validation.errors);
    }

    return {
      data: migrated,
      validation,
      migrationLog: {
        timestamp: Date.now(),
        sourceFormat: 'legacy',
        targetFormat: targetAPI,
        recordCount: Array.isArray(oldMockData) ? oldMockData.length : 1
      }
    };
  }

  // Create test datasets for different scenarios
  createTestDatasets() {
    return {
      small: this.alignment.generateNVDMockData(10),
      medium: this.alignment.generateNVDMockData(100),
      large: this.alignment.generateNVDMockData(1000),
      performance: this.alignment.generateBatchMockData('nvd', 5000, 500),
      mixed: {
        nvd: this.alignment.generateNVDMockData(50),
        opencve: this.alignment.generateOpenCVEMockData(30),
        ipinfo: Array.from({ length: 20 }, () => 
          this.alignment.generateIPInfoMockData()
        )
      }
    };
  }
}

export { 
  MockDataAlignmentSystem, 
  MockDataValidator, 
  MockDataMigrator 
};