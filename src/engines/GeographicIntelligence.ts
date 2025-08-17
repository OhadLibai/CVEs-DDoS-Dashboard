// src/engines/GeographicIntelligence.ts

// @ts-ignore - APIOrchestrator will be created in Phase 3
import { APIOrchestrator } from '../api/core/ApiOrchestrator';

/**
 * Provides geographic intelligence by analyzing IP addresses for location,
 * network data, and threat levels. Manages ASN databases and geofencing.
 */
export class EnhancedGeographicIntelligence {
  private api: APIOrchestrator;
  private countryThreatLevels: Map<string, number>;
  private asnDatabase: Map<string, any>;
  private geoFences: Map<string, any>;
  private threatClusters: Map<string, any>;

  constructor(apiOrchestrator: APIOrchestrator) {
    this.api = apiOrchestrator;
    this.countryThreatLevels = new Map();
    this.asnDatabase = new Map();
    this.geoFences = new Map();
    this.threatClusters = new Map();
  }

  async analyzeIPGeographics(ips: string[]) {
    const results: { [key: string]: any } = {};
    const batchSize = 10;
    
    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const batchPromises = batch.map(ip => this.analyzeIPLocation(ip));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const ip = batch[index];
          if (result.status === 'fulfilled') {
            results[ip] = result.value;
          } else {
            results[ip] = { ip, error: result.reason?.message || 'Unknown error' };
          }
        });
        
        if (i + batchSize < ips.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Batch processing failed:', error);
      }
    }
    
    return results;
  }

  async analyzeIPLocation(ip: string) {
    try {
      const ipData = await this.api.getIPIntelligence(ip);
      
      const analysis = {
        ip,
        location: {
          country: ipData.country || 'Unknown',
          countryName: ipData.country_name || 'Unknown',
          city: ipData.city || 'Unknown',
          region: ipData.region || 'Unknown',
          coordinates: ipData.coordinates || { lat: null, lng: null },
          timezone: ipData.timezone || null
        },
        network: {
          asn: ipData.asn || null,
          org: ipData.org || 'Unknown',
          isp: ipData.isp || 'Unknown',
          hostname: ipData.hostname || null
        },
        threat: {
          level: this.calculateThreatLevel(ipData),
          riskFactors: this.identifyRiskFactors(ipData),
          geoFenceViolations: this.checkGeoFences(ipData),
          clusterMembership: this.identifyThreatClusters(ipData)
        },
        metadata: {
          source: ipData.source || 'unknown',
          timestamp: Date.now(),
          fromCache: ipData.fromCache || false
        }
      };

      this.updateASNDatabase(analysis);
      this.updateCountryThreatLevels(analysis);
      
      return analysis;
    } catch (error: any) {
      console.error(`IP analysis failed for ${ip}:`, error);
      return { ip, error: error.message, timestamp: Date.now() };
    }
  }

  private calculateThreatLevel(ipData: any) {
    let score = 0;
    const factors = [];

    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    const mediumRiskCountries = ['PK', 'BD', 'VN', 'IN'];
    
    if (highRiskCountries.includes(ipData.country)) {
      score += 40;
      factors.push('High-risk country');
    } else if (mediumRiskCountries.includes(ipData.country)) {
      score += 20;
      factors.push('Medium-risk country');
    }

    if (ipData.org) {
      const org = ipData.org.toLowerCase();
      if (org.includes('cloud') || org.includes('hosting') || org.includes('vps')) {
        score += 15;
        factors.push('Cloud/hosting provider');
      }
      if (org.includes('tor') || org.includes('proxy')) {
        score += 30;
        factors.push('Tor/proxy service');
      }
    }

    const historicalRisk = this.getHistoricalThreatScore(ipData.country);
    score += historicalRisk;
    if (historicalRisk > 0) {
      factors.push(`Historical activity: +${historicalRisk}`);
    }

    const level = score >= 70 ? 'Critical' : score >= 40 ? 'High' : score >= 20 ? 'Medium' : 'Low';
    return { level, score, factors };
  }

  private identifyRiskFactors(ipData: any) {
    const risks = [];
    if (ipData.asn) {
      const asnData = this.asnDatabase.get(ipData.asn);
      if (asnData?.suspiciousActivity > 5) {
        risks.push({ type: 'network', description: 'ASN has history of malicious activity', severity: 'high' });
      }
    }
    if (ipData.country && this.countryThreatLevels.get(ipData.country)! > 0.7) {
      risks.push({ type: 'geographic', description: 'Country has elevated threat activity', severity: 'medium' });
    }
    if (ipData.org?.toLowerCase().includes('residential')) {
      risks.push({ type: 'infrastructure', description: 'Residential IP used for attacks', severity: 'medium' });
    }
    return risks;
  }

  private checkGeoFences(ipData: any) {
    const violations: any[] = [];
    for (const [name, fence] of this.geoFences.entries()) {
      if (this.isWithinGeoFence(ipData, fence)) {
        violations.push({ fence: name, type: fence.type, action: fence.action, severity: fence.severity });
      }
    }
    return violations;
  }

  private identifyThreatClusters(ipData: any) {
    const clusters = [];
    if (ipData.asn) {
      const asnCluster = this.threatClusters.get(`asn:${ipData.asn}`);
      if (asnCluster) clusters.push({ type: 'asn', id: ipData.asn, confidence: asnCluster.confidence, threatCount: asnCluster.threatCount });
    }
    const geoKey = `${ipData.country}:${ipData.city}`;
    const geoCluster = this.threatClusters.get(`geo:${geoKey}`);
    if (geoCluster) clusters.push({ type: 'geographic', location: geoKey, confidence: geoCluster.confidence, threatCount: geoCluster.threatCount });
    return clusters;
  }

  private updateASNDatabase(analysis: any) {
    if (!analysis.network.asn) return;
    const existing = this.asnDatabase.get(analysis.network.asn) || { asn: analysis.network.asn, org: analysis.network.org, threatCount: 0, suspiciousActivity: 0, countries: new Set(), lastSeen: null };
    existing.threatCount++;
    existing.countries.add(analysis.location.country);
    existing.lastSeen = Date.now();
    if (analysis.threat.level === 'Critical' || analysis.threat.level === 'High') {
      existing.suspiciousActivity++;
    }
    this.asnDatabase.set(analysis.network.asn, existing);
  }

  private updateCountryThreatLevels(analysis: any) {
    const country = analysis.location.country;
    if (!country || country === 'Unknown') return;
    const existing = this.countryThreatLevels.get(country) || 0;
    const increment = analysis.threat.level === 'Critical' ? 0.1 : analysis.threat.level === 'High' ? 0.05 : 0.01;
    this.countryThreatLevels.set(country, Math.min(existing + increment, 1.0));
  }

  createGeoFence(name: string, config: any) {
    this.geoFences.set(name, { name, type: config.type, parameters: config.parameters, action: config.action, severity: config.severity, created: Date.now(), enabled: true });
  }

  private isWithinGeoFence(ipData: any, fence: any) {
    switch (fence.type) {
      case 'country': return fence.parameters.countries.includes(ipData.country);
      case 'region': return fence.parameters.regions.includes(ipData.region);
      case 'circle': return this.isWithinCircle(ipData.coordinates, fence.parameters);
      case 'polygon': return this.isWithinPolygon(ipData.coordinates, fence.parameters);
      default: return false;
    }
  }

  private isWithinCircle(coords: any, circleParams: any) {
    if (!coords.lat || !coords.lng) return false;
    const distance = this.calculateDistance(coords.lat, coords.lng, circleParams.centerLat, circleParams.centerLng);
    return distance <= circleParams.radius;
  }
  
  private isWithinPolygon(coords: any, polygonParams: any): boolean {
    // Polygon check logic would go here
    return false;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getHistoricalThreatScore(country: string) {
    const threatHistory: { [key: string]: number } = { 'CN': 25, 'RU': 30, 'KP': 35, 'IR': 20, 'PK': 15, 'BD': 10, 'VN': 12, 'IN': 8 };
    return threatHistory[country] || 0;
  }

  generateThreatReport() {
    return {
      timestamp: Date.now(),
      summary: { totalASNs: this.asnDatabase.size, threatCountries: this.countryThreatLevels.size, activeFences: Array.from(this.geoFences.values()).filter(f => f.enabled).length, threatClusters: this.threatClusters.size },
      topThreatCountries: this.getTopThreatCountries(10),
      topMaliciousASNs: this.getTopMaliciousASNs(10),
      recentAlerts: this.getRecentGeoFenceAlerts(50)
    };
  }

  private getTopThreatCountries(limit: number) {
    return Array.from(this.countryThreatLevels.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([country, level]) => ({ country, threatLevel: level, percentage: Math.round(level * 100) }));
  }

  private getTopMaliciousASNs(limit: number) {
    return Array.from(this.asnDatabase.values()).sort((a, b) => b.suspiciousActivity - a.suspiciousActivity).slice(0, limit).map(asn => ({ asn: asn.asn, org: asn.org, suspiciousActivity: asn.suspiciousActivity, threatCount: asn.threatCount, countries: Array.from(asn.countries) }));
  }

  private getRecentGeoFenceAlerts(limit: number) {
    return [];
  }
}