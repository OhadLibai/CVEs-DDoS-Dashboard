// src/utils/mock/MockDataGenerator.ts
import { CorporateIntelligence } from '../../engines/CorporateIntelligence';
import { AdvancedAnalyticsEngine } from '../../engines/AdvancedAnalyticsEngine';
import { GeographicIntelligence } from '../../engines/GeographicIntelligence';

/**
 * A unified mock data generator that produces realistic and interconnected data
 * for all parts of the application, leveraging the core intelligence engines.
 */
export const generateMockDDoSData = (count = 50) => {
  const attackTypes = ['Volumetric', 'Protocol', 'Application Layer', 'Amplification', 'Botnet'];
  const industries = ['Finance', 'Gaming', 'E-commerce', 'Government', 'Healthcare', 'Technology'];
  const protocols = ['HTTP/HTTPS', 'DNS', 'NTP', 'SSDP', 'Memcached', 'LDAP'];
  const vendors = ['Microsoft', 'Cisco', 'Apache', 'Google', 'Huawei', 'Juniper', 'SAP', 'Amazon'];
  const sourceLanguages = ['English', 'Chinese', 'Russian', 'Korean', 'Arabic', 'Portuguese'];
  const attackVectors = ['Volumetric', 'Protocol', 'Application Layer'];
  
  const corporateIntel = new CorporateIntelligence();
  // @ts-ignore
  const analyticsEngine = new AdvancedAnalyticsEngine();
  // @ts-ignore
  const geoIntel = new GeographicIntelligence(null); // API Orchestrator is not needed for this mock data part.

  const fortune500Companies = Object.keys(corporateIntel['fortune500Companies']);
  const protocolData = analyticsEngine.getProtocolAnalysis();
  const mockCVEs = [];
  
  for (let i = 0; i < count; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const affectedCompany = fortune500Companies[Math.floor(Math.random() * fortune500Companies.length)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    
    mockCVEs.push({
      id: `CVE-2024-${1000 + i}`,
      confidence: Math.random() * 100,
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      protocol,
      cvssScore: (Math.random() * 4 + 6).toFixed(1),
      publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `DDoS vulnerability in ${vendor} products affecting ${affectedCompany} infrastructure via ${protocol} protocol.`,
      vendor,
      affectedCompany,
      // @ts-ignore
      affectedCompanyData: corporateIntel.fortune500Companies[affectedCompany],
      // @ts-ignore
      geoLocation: geoIntel.mapVendorToLocation(vendor),
      sourceLanguage: sourceLanguages[Math.floor(Math.random() * sourceLanguages.length)],
      attackVector: attackVectors[Math.floor(Math.random() * attackVectors.length)],
      protocolDetails: protocolData.protocols[protocol] || protocolData.protocols['HTTP/HTTPS'],
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