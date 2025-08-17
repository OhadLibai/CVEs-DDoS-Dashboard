// src/engines/DDoSCorrelationEngine.ts

// @ts-ignore - APIOrchestrator will be created in Phase 3
import { APIOrchestrator } from '../api/core/ApiOrchestrator';

/**
 * Analyzes CVE data to identify and score vulnerabilities related to DDoS attacks.
 * It uses a weighted scoring system based on keywords, CWEs, CVSS data, and product types.
 */
export class EnhancedDDoSCorrelationEngine {
  private api: APIOrchestrator;
  private ddosKeywords: string[];
  private ddosCWEs: string[];
  private networkProducts: string[];

  constructor(apiOrchestrator: APIOrchestrator) {
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

  async searchDDoSVulnerabilities(params: any = {}) {
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
    } catch (error: any) {
      console.error('DDoS vulnerability search failed:', error);
      return { 
        ddosCVEs: [], 
        totalFound: 0, 
        error: error.message,
        fallbackToMock: true
      };
    }
  }

  analyzeCVEForDDoS(cve: any) {
    const description = this.extractDescription(cve);
    const cveId = cve.cve?.CVE_data_meta?.ID || cve.cve?.id || 'Unknown';
    
    let score = 0;
    const indicators: any = {
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
      protocol: this.extractProtocol(description),
      geoData: null,
      extractedIPs: indicators.extractedIPs
    };
  }

  private getKeywordWeight(keyword: string): number {
    const weights: { [key: string]: number } = {
      'ddos': 20, 'denial of service': 20, 'amplification': 15,
      'syn flood': 15, 'udp flood': 15, 'http flood': 15,
      'exhaustion': 12, 'flooding': 10, 'overload': 10,
      'slowloris': 15, 'ping flood': 12, 'bandwidth': 8
    };
    return weights[keyword] || 5;
  }

  private extractDescription(cve: any): string {
    const descriptions = cve.cve?.descriptions || cve.cve?.description?.description_data || [];
    for (const desc of descriptions) {
      if (desc.lang === 'en' || desc.language === 'en') {
        return desc.value || desc.description || '';
      }
    }
    return descriptions[0]?.value || descriptions[0]?.description || '';
  }

  private extractCVSSData(cve: any) {
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

  private extractCWEs(weaknesses: any[]): string[] {
    const cwes: string[] = [];
    if (Array.isArray(weaknesses)) {
      weaknesses.forEach(weakness => {
        if (weakness.description) {
          weakness.description.forEach((desc: any) => {
            if (desc.value && desc.value.startsWith('CWE-')) {
              cwes.push(desc.value);
            }
          });
        }
      });
    }
    return cwes;
  }

  private analyzeProducts(cve: any): number {
    let score = 0;
    const configs = cve.cve?.configurations?.nodes || [];
    configs.forEach((node: any) => {
      node.cpeMatch?.forEach((match: any) => {
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

  private extractIPAddresses(text: string): string[] {
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    return text.match(ipRegex) || [];
  }

  private extractPublishedDate(cve: any): Date | null {
    const published = cve.cve?.published || cve.publishedDate || cve.cve?.CVE_data_meta?.DATE_PUBLIC;
    return published ? new Date(published) : null;
  }

  private determineAttackType(indicators: any): string {
    const keywords = indicators.keywords.join(' ').toLowerCase();
    if (keywords.includes('amplification') || keywords.includes('reflection')) return 'Amplification';
    if (keywords.includes('syn') || keywords.includes('tcp')) return 'Protocol';
    if (keywords.includes('http') || keywords.includes('application')) return 'Application Layer';
    if (keywords.includes('udp') || keywords.includes('flood')) return 'Volumetric';
    return 'Mixed';
  }

  private determineTargetIndustry(description: string): string {
    const industries: { [key: string]: string[] } = {
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

  private extractProtocol(description: string): string {
    const protocols = ['HTTP', 'HTTPS', 'DNS', 'UDP', 'TCP', 'ICMP', 'NTP', 'SSDP', 'Memcached'];
    const descUpper = description.toUpperCase();
    for (const protocol of protocols) {
      if (descUpper.includes(protocol)) return protocol;
    }
    return 'Unknown';
  }
}