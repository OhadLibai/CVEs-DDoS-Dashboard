import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, MapPin, Code2, Cpu, AlertTriangle, TrendingUp, Activity, Settings } from 'lucide-react';
import { APIOrchestrator } from './api-orchestrator';
import { VirtualCVEList, usePaginatedData } from './virtual-scrolling';
import { useVisualizationCleanup } from './memory-management';

// Theme Colors
const theme = {
  primary: '#454545',
  accent: '#FF6000', 
  lightAccent: '#FFA559',
  cream: '#FFE6C7',
  dark: '#2A2A2A',
  light: '#F8F8F8'
};

// Enhanced DDoS Correlation Engine with real API integration
class EnhancedDDoSCorrelationEngine {
  constructor(apiOrchestrator) {
    this.api = apiOrchestrator;
    this.ddosKeywords = [
      'denial of service', 'dos attack', 'ddos', 'amplification',
      'exhaustion', 'flooding', 'resource consumption', 'availability',
      'traffic flood', 'bandwidth', 'overload', 'overwhelm', 'slowloris',
      'syn flood', 'udp flood', 'http flood', 'ping flood'
    ];
    this.ddosCWEs = [
      'CWE-400', 'CWE-770', 'CWE-834', 'CWE-672', 'CWE-730',
      'CWE-920', 'CWE-404', 'CWE-405', 'CWE-409', 'CWE-399'
    ];
    this.networkProducts = [
      'router', 'firewall', 'load balancer', 'dns server', 'web server',
      'proxy', 'gateway', 'switch', 'network device', 'apache', 'nginx',
      'iis', 'cisco', 'juniper', 'f5', 'palo alto'
    ];
  }

  async searchDDoSVulnerabilities(params = {}) {
    try {
      // Build search parameters optimized for DDoS detection
      const searchParams = {
        keywordSearch: 'denial service OR amplification OR flood OR exhaustion',
        cvssV3Severity: params.minSeverity || 'MEDIUM',
        resultsPerPage: params.limit || 100,
        startIndex: params.offset || 0,
        ...params
      };

      const result = await this.api.searchCVEs(searchParams);
      
      if (!result.vulnerabilities) {
        return { ddosCVEs: [], totalFound: 0, error: 'No vulnerabilities returned' };
      }

      // Analyze each CVE for DDoS relevance
      const analyzedCVEs = [];
      for (const vuln of result.vulnerabilities) {
        const analysis = this.analyzeCVEForDDoS(vuln);
        if (analysis.isDDoSRelated) {
          // Enrich with IP intelligence if IPs are found
          if (analysis.extractedIPs && analysis.extractedIPs.length > 0) {
            try {
              const ipData = await this.api.getIPIntelligence(analysis.extractedIPs[0]);
              analysis.geoData = ipData;
            } catch (ipError) {
              console.warn('IP enrichment failed:', ipError);
            }
          }
          analyzedCVEs.push(analysis);
        }
      }

      return {
        ddosCVEs: analyzedCVEs.sort((a, b) => b.confidence - a.confidence),
        totalAnalyzed: result.vulnerabilities.length,
        totalFound: analyzedCVEs.length,
        totalResults: result.totalResults,
        fromCache: result.fromCache,
        source: result.source
      };
    } catch (error) {
      console.error('DDoS vulnerability search failed:', error);
      return { 
        ddosCVEs: [], 
        totalFound: 0, 
        error: error.message,
        fallbackToMock: true
      };
    }
  }

  analyzeCVEForDDoS(cve) {
    const description = this.extractDescription(cve);
    const cveId = cve.cve?.CVE_data_meta?.ID || cve.cve?.id || 'Unknown';
    
    let score = 0;
    const indicators = {
      keywords: [],
      cwes: [],
      cvss: null,
      networkBased: false,
      highAvailabilityImpact: false,
      extractedIPs: []
    };

    // Enhanced keyword analysis with weighted scoring
    this.ddosKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        const weight = this.getKeywordWeight(keyword);
        score += weight;
        indicators.keywords.push(keyword);
      }
    });

    // CWE analysis
    const weaknesses = cve.cve?.weaknesses || cve.cve?.problemtype?.problemtype_data || [];
    this.extractCWEs(weaknesses).forEach(cweId => {
      if (this.ddosCWEs.includes(cweId)) {
        score += 15;
        indicators.cwes.push(cweId);
      }
    });

    // Enhanced CVSS analysis
    const cvssData = this.extractCVSSData(cve);
    if (cvssData) {
      indicators.cvss = cvssData;
      
      if (cvssData.attackVector === 'NETWORK') {
        score += 10;
        indicators.networkBased = true;
      }
      
      if (cvssData.availabilityImpact === 'HIGH') {
        score += 15;
        indicators.highAvailabilityImpact = true;
      }
    }

    // Product/vendor analysis
    const productScore = this.analyzeProducts(cve);
    score += productScore;

    // Extract IP addresses from description
    indicators.extractedIPs = this.extractIPAddresses(description);

    // Calculate publication recency bonus
    const publishedDate = this.extractPublishedDate(cve);
    if (publishedDate) {
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 90) { // Recent vulnerabilities get bonus
        score += Math.max(0, 10 - (daysSincePublished / 10));
      }
    }

    return {
      id: cveId,
      isDDoSRelated: score >= 25,
      confidence: Math.min(score / 60 * 100, 100), // Normalized confidence score
      score,
      indicators,
      cve,
      description,
      publishedDate: publishedDate?.toISOString().split('T')[0] || 'Unknown',
      cvssScore: cvssData?.baseScore || 'N/A',
      attackType: this.determineAttackType(indicators),
      industry: this.determineTargetIndustry(description),
      protocol: this.extractProtocol(description)
    };
  }

  getKeywordWeight(keyword) {
    const weights = {
      'ddos': 20, 'denial of service': 20, 'amplification': 15,
      'syn flood': 15, 'udp flood': 15, 'http flood': 15,
      'exhaustion': 12, 'flooding': 10, 'overload': 10,
      'slowloris': 15, 'ping flood': 12, 'bandwidth': 8
    };
    return weights[keyword] || 5;
  }

  extractDescription(cve) {
    const descriptions = cve.cve?.descriptions || 
                        cve.cve?.description?.description_data || [];
    
    for (const desc of descriptions) {
      if (desc.lang === 'en' || desc.language === 'en') {
        return desc.value || desc.description || '';
      }
    }
    
    return descriptions[0]?.value || descriptions[0]?.description || '';
  }

  extractCVSSData(cve) {
    const metrics = cve.cve?.metrics || cve.impact || {};
    const cvssV31 = metrics.cvssMetricV31?.[0] || metrics.cvssV31;
    const cvssV30 = metrics.cvssMetricV30?.[0] || metrics.cvssV30;
    const cvssV2 = metrics.cvssMetricV2?.[0] || metrics.cvssV2;

    const cvssData = cvssV31?.cvssData || cvssV30?.cvssData || cvssV2?.cvssData;
    
    if (cvssData) {
      return {
        version: cvssV31 ? '3.1' : cvssV30 ? '3.0' : '2.0',
        baseScore: cvssData.baseScore,
        attackVector: cvssData.attackVector,
        attackComplexity: cvssData.attackComplexity,
        availabilityImpact: cvssData.availabilityImpact,
        vectorString: cvssData.vectorString
      };
    }
    
    return null;
  }

  extractCWEs(weaknesses) {
    const cwes = [];
    
    if (Array.isArray(weaknesses)) {
      weaknesses.forEach(weakness => {
        if (weakness.description) {
          weakness.description.forEach(desc => {
            if (desc.value && desc.value.startsWith('CWE-')) {
              cwes.push(desc.value);
            }
          });
        }
      });
    }
    
    return cwes;
  }

  analyzeProducts(cve) {
    let score = 0;
    const configs = cve.cve?.configurations?.nodes || [];
    
    configs.forEach(node => {
      node.cpeMatch?.forEach(match => {
        const criteria = match.criteria?.toLowerCase() || '';
        this.networkProducts.forEach(product => {
          if (criteria.includes(product)) {
            score += 8;
          }
        });
      });
    });
    
    return Math.min(score, 20); // Cap product score
  }

  extractIPAddresses(text) {
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    return text.match(ipRegex) || [];
  }

  extractPublishedDate(cve) {
    const published = cve.cve?.published || 
                     cve.publishedDate || 
                     cve.cve?.CVE_data_meta?.DATE_PUBLIC;
    
    return published ? new Date(published) : null;
  }

  determineAttackType(indicators) {
    const keywords = indicators.keywords.join(' ').toLowerCase();
    
    if (keywords.includes('amplification') || keywords.includes('reflection')) {
      return 'Amplification';
    } else if (keywords.includes('syn') || keywords.includes('tcp')) {
      return 'Protocol';
    } else if (keywords.includes('http') || keywords.includes('application')) {
      return 'Application Layer';
    } else if (keywords.includes('udp') || keywords.includes('flood')) {
      return 'Volumetric';
    }
    
    return 'Mixed';
  }

  determineTargetIndustry(description) {
    const industries = {
      'financial': ['bank', 'financial', 'payment', 'credit', 'trading'],
      'healthcare': ['hospital', 'medical', 'health', 'patient'],
      'government': ['government', 'military', 'federal', 'agency'],
      'technology': ['software', 'cloud', 'saas', 'platform'],
      'gaming': ['game', 'gaming', 'entertainment'],
      'ecommerce': ['ecommerce', 'retail', 'shop', 'commerce']
    };
    
    const descLower = description.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => descLower.includes(keyword))) {
        return industry.charAt(0).toUpperCase() + industry.slice(1);
      }
    }
    
    return 'General';
  }

  extractProtocol(description) {
    const protocols = ['HTTP', 'HTTPS', 'DNS', 'UDP', 'TCP', 'ICMP', 'NTP', 'SSDP', 'Memcached'];
    const descUpper = description.toUpperCase();
    
    for (const protocol of protocols) {
      if (descUpper.includes(protocol)) {
        return protocol;
      }
    }
    
    return 'Unknown';
  }
}

// Enhanced Analytics Hub Component
const EnhancedAnalyticsHub = () => {
  const [apiOrchestrator] = useState(() => new APIOrchestrator({
    // Add API keys here when available
    // nvdApiKey: 'your-nvd-api-key',
    // ipinfoApiKey: 'your-ipinfo-api-key'
  }));
  
  const [correlationEngine] = useState(() => new EnhancedDDoSCorrelationEngine(apiOrchestrator));
  
  const [filters, setFilters] = useState({
    attackType: '',
    industry: '',
    minCVSS: 0,
    dateRange: '',
    protocol: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('confidence');
  const [useRealAPI, setUseRealAPI] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  // Virtual scrolling cleanup
  const canvasRef = React.useRef(null);
  const { datasets, getCleanupStats } = useVisualizationCleanup(canvasRef);

  // Paginated data hook for CVE loading
  const {
    data: cveData,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh
  } = usePaginatedData({
    fetchFunction: useCallback(async (params) => {
      if (useRealAPI) {
        return await correlationEngine.searchDDoSVulnerabilities(params);
      } else {
        // Fallback to mock data
        const mockData = generateMockDDoSData();
        return {
          ddosCVEs: mockData.slice(params.offset || 0, (params.offset || 0) + (params.limit || 50)),
          totalFound: mockData.length,
          fallbackToMock: true
        };
      }
    }, [correlationEngine, useRealAPI]),
    pageSize: 50
  });

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = cveData.ddosCVEs || cveData || [];
    
    // Apply filters
    filtered = filtered.filter(item => {
      return (
        (!filters.attackType || item.attackType === filters.attackType) &&
        (!filters.industry || item.industry === filters.industry) &&
        (!filters.protocol || item.protocol === filters.protocol) &&
        (item.cvssScore === 'N/A' || parseFloat(item.cvssScore) >= filters.minCVSS) &&
        (!searchTerm || 
         item.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'confidence': 
          return (b.confidence || 0) - (a.confidence || 0);
        case 'cvss': 
          const scoreA = parseFloat(a.cvssScore) || 0;
          const scoreB = parseFloat(b.cvssScore) || 0;
          return scoreB - scoreA;
        case 'date': 
          return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
        default: 
          return 0;
      }
    });
    
    return filtered;
  }, [cveData, filters, searchTerm, sortBy]);

  // Load service status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await apiOrchestrator.getServiceStatus();
        setServiceStatus(status);
      } catch (error) {
        console.warn('Failed to load service status:', error);
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [apiOrchestrator]);

  // Add datasets to memory manager
  useEffect(() => {
    if (filteredData.length > 0) {
      datasets.addDataset('filtered_cves', filteredData, {
        maxAge: 1800000, // 30 minutes
        priority: 'high'
      });
    }
  }, [filteredData, datasets]);

  const handleCVEClick = useCallback((cve) => {
    console.log('CVE clicked:', cve);
    // Could open detailed view modal here
  }, []);

  const toggleAPIMode = useCallback(() => {
    setUseRealAPI(!useRealAPI);
    refresh(); // Reload data with new mode
  }, [useRealAPI, refresh]);

  // Mock data generator (fallback)
  const generateMockDDoSData = () => {
    const attackTypes = ['Volumetric', 'Protocol', 'Application Layer', 'Amplification', 'Mixed'];
    const industries = ['Financial', 'Gaming', 'E-commerce', 'Government', 'Healthcare', 'Technology', 'General'];
    const protocols = ['HTTP/HTTPS', 'DNS', 'NTP', 'SSDP', 'Memcached', 'LDAP', 'UDP', 'TCP', 'ICMP'];
    
    const mockCVEs = [];
    for (let i = 0; i < 500; i++) { // Generate more data for testing
      mockCVEs.push({
        id: `CVE-2024-${1000 + i}`,
        confidence: Math.random() * 100,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        cvssScore: (Math.random() * 4 + 6).toFixed(1),
        publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `DDoS vulnerability enabling ${attackTypes[Math.floor(Math.random() * attackTypes.length)].toLowerCase()} attacks against ${industries[Math.floor(Math.random() * industries.length)].toLowerCase()} infrastructure`,
        indicators: {
          keywords: ['denial of service', 'amplification'],
          cwes: ['CWE-400', 'CWE-770'],
          networkBased: true,
          highAvailabilityImpact: true
        }
      });
    }
    return mockCVEs;
  };

  if (loading && !cveData.length) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: `4px solid ${theme.cream}`,
          borderTop: `4px solid ${theme.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: theme.primary, fontSize: '1.2rem' }}>
          {useRealAPI ? 'Loading real DDoS-CVE correlations...' : 'Loading mock data...'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          color: theme.primary, 
          fontSize: '2.8rem',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          Enhanced DDoS Analytics Hub
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Real-time API integration with advanced correlation analysis and virtual scrolling for large datasets
        </p>
      </div>

      {/* Service Status & Controls */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: theme.primary, margin: 0 }}>System Status & Controls</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={toggleAPIMode}
              style={{
                background: useRealAPI ? theme.accent : '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {useRealAPI ? 'Real API' : 'Mock Data'}
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              style={{
                background: loading ? '#95a5a6' : theme.primary,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Service Status Grid */}
        {serviceStatus && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            {Object.entries(serviceStatus.services).map(([name, status]) => (
              <div key={name} style={{
                background: status.enabled ? '#27ae6020' : '#95a5a620',
                border: `2px solid ${status.enabled ? '#27ae60' : '#95a5a6'}40`,
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: theme.primary }}>
                  {name.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {status.requests}/{status.limit} requests
                </div>
                <div style={{
                  background: status.enabled ? '#27ae60' : '#95a5a6',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  marginTop: '4px',
                  display: 'inline-block'
                }}>
                  {status.enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Memory Stats */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>Memory Usage:</strong> {serviceStatus?.cache.totalItems || 0} cached items, 
          Memory Manager: {getCleanupStats().count} cleanup functions registered
          {error && (
            <div style={{ color: '#e74c3c', marginTop: '8px' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
              Search CVEs
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                placeholder="CVE ID or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Enhanced Filters */}
          {['attackType', 'industry', 'protocol'].map(filterKey => (
            <div key={filterKey}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <select
                value={filters[filterKey]}
                onChange={(e) => setFilters({...filters, [filterKey]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">All {filterKey}s</option>
                {filterKey === 'attackType' && ['Volumetric', 'Protocol', 'Application Layer', 'Amplification', 'Mixed'].map(type => 
                  <option key={type} value={type}>{type}</option>
                )}
                {filterKey === 'industry' && ['Financial', 'Gaming', 'E-commerce', 'Government', 'Healthcare', 'Technology', 'General'].map(industry => 
                  <option key={industry} value={industry}>{industry}</option>
                )}
                {filterKey === 'protocol' && ['HTTP/HTTPS', 'DNS', 'UDP', 'TCP', 'ICMP', 'NTP', 'SSDP'].map(protocol => 
                  <option key={protocol} value={protocol}>{protocol}</option>
                )}
              </select>
            </div>
          ))}

          {/* CVSS Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
              Min CVSS Score: {filters.minCVSS}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={filters.minCVSS}
              onChange={(e) => setFilters({...filters, minCVSS: parseFloat(e.target.value)})}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, ${theme.lightAccent}, ${theme.accent})`,
                outline: 'none'
              }}
            />
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.cream}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="confidence">Confidence</option>
              <option value="cvss">CVSS Score</option>
              <option value="date">Published Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Results Summary */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {filteredData.length}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>DDoS-Related CVEs</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {totalCount > 0 && `of ${totalCount} total`}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {filteredData.length > 0 ? 
                (filteredData.reduce((sum, item) => sum + (parseFloat(item.cvssScore) || 0), 0) / filteredData.length).toFixed(1) : 
                '0.0'
              }
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Avg CVSS Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {filteredData.length > 0 ? 
                Math.round(filteredData.reduce((sum, item) => sum + (item.confidence || 0), 0) / filteredData.length) : 
                0
              }%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Avg Confidence</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {useRealAPI ? 'API' : 'MOCK'}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Data Source</div>
          </div>
        </div>
      </div>

      {/* Virtual Scrolling CVE List */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        overflow: 'hidden'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
          padding: '20px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: theme.cream }}>
            CVE Analysis Results
          </h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Virtual Scrolling: {filteredData.length} items
            {hasMore && ' (More available)'}
          </div>
        </div>

        <VirtualCVEList
          cves={filteredData}
          height={600}
          onLoadMore={hasMore ? loadMore : null}
          loadingMore={loadingMore}
          onCVEClick={handleCVEClick}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default EnhancedAnalyticsHub;