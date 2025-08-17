// src/engines/CorporateIntelligence.ts

/**
 * Manages intelligence related to corporate entities, including a mock Fortune 500 database,
 * industry sector analysis, and the generation of company-specific risk profiles.
 */
export class CorporateIntelligence {
  private fortune500Companies: any;
  private industrySectors: any;
  private corporateRiskProfiles: any;

  constructor() {
    this.fortune500Companies = this.initializeFortune500Database();
    this.industrySectors = this.initializeIndustrySectors();
    this.corporateRiskProfiles = this.generateCorporateRiskProfiles();
  }

  private initializeFortune500Database() {
    // Abridged for brevity
    return {
      'Apple': { rank: 3, sector: 'Technology', revenue: 394328, employees: 164000, headquarters: 'United States', vulnerabilities: 45, ddosIncidents: 12, riskScore: 78, lastIncident: '2024-01-15', primaryAssets: ['iOS', 'macOS', 'Cloud Services'], marketCap: 3000000 },
      'Microsoft': { rank: 14, sector: 'Technology', revenue: 211915, employees: 221000, headquarters: 'United States', vulnerabilities: 89, ddosIncidents: 34, riskScore: 85, lastIncident: '2024-02-03', primaryAssets: ['Windows', 'Azure', 'Office 356'], marketCap: 2800000 },
      'JPMorgan Chase': { rank: 24, sector: 'Financial Services', revenue: 158100, employees: 293723, headquarters: 'United States', vulnerabilities: 156, ddosIncidents: 89, riskScore: 95, lastIncident: '2024-02-12', primaryAssets: ['Banking', 'Investment', 'Digital Banking'], marketCap: 500000 },
      'Verizon': { rank: 20, sector: 'Telecommunications', revenue: 136835, employees: 117100, headquarters: 'United States', vulnerabilities: 134, ddosIncidents: 78, riskScore: 94, lastIncident: '2024-02-11', primaryAssets: ['Wireless', 'Broadband', '5G Network'], marketCap: 170000 },
    };
  }
  
  private initializeIndustrySectors() {
    // Abridged for brevity
    return {
      'Technology': { name: 'Technology', companies: 5, totalVulnerabilities: 402, totalIncidents: 170, avgRiskScore: 83, riskLevel: 'High', color: '#3498db', primaryThreats: ['Data Breaches', 'DDoS Attacks', 'API Vulnerabilities'], criticalAssets: ['Cloud Infrastructure', 'User Data', 'Platform Services'] },
      'Financial Services': { name: 'Financial Services', companies: 3, totalVulnerabilities: 388, totalIncidents: 201, avgRiskScore: 91, riskLevel: 'Critical', color: '#e74c3c', primaryThreats: ['Financial Fraud', 'DDoS Attacks', 'Data Theft'], criticalAssets: ['Customer Data', 'Transaction Systems', 'Digital Banking'] },
    };
  }

  private generateCorporateRiskProfiles() {
    const profiles: { [key: string]: any } = {};
    Object.entries(this.fortune500Companies).forEach(([company, data]) => {
      profiles[company] = {
        overallRisk: this.calculateOverallRisk(data),
        ddosRisk: this.calculateDDoSRisk(data),
        financialImpact: this.calculateFinancialImpact(data),
        reputationalRisk: this.calculateReputationalRisk(data),
        recommendations: this.generateRecommendations(data),
        trendAnalysis: this.generateTrendAnalysis(data)
      };
    });
    return profiles;
  }

  private calculateOverallRisk(companyData: any) {
    const vulnScore = Math.min(companyData.vulnerabilities / 200 * 100, 100);
    const incidentScore = Math.min(companyData.ddosIncidents / 100 * 100, 100);
    const sectorMultiplier = ['Financial Services', 'Telecommunications'].includes(companyData.sector) ? 1.2 : 1.0;
    const sizeScore = Math.min(companyData.employees / 2000000 * 100, 100);
    return Math.round((vulnScore * 0.3 + incidentScore * 0.4 + sizeScore * 0.1) * sectorMultiplier);
  }

  private calculateDDoSRisk(companyData: any) {
    const baseRisk = companyData.ddosIncidents * 2;
    const sectorMultiplier: { [key: string]: number } = { 'Financial Services': 1.5, 'Telecommunications': 1.4, 'Technology': 1.3, 'Retail': 1.2, 'Healthcare': 1.0, 'Energy': 1.1, 'Automotive': 1.1 };
    return Math.min(baseRisk * (sectorMultiplier[companyData.sector] || 1.0), 100);
  }

  private calculateFinancialImpact(companyData: any) {
    const revenueImpactPerIncident = companyData.revenue * 0.001;
    const estimatedAnnualLoss = revenueImpactPerIncident * companyData.ddosIncidents;
    return {
      estimatedAnnualLoss: Math.round(estimatedAnnualLoss),
      revenueAtRisk: Math.round((estimatedAnnualLoss / companyData.revenue) * 100 * 10) / 10,
      costPerIncident: Math.round(revenueImpactPerIncident)
    };
  }

  private calculateReputationalRisk(companyData: any) {
    const publicFacing = ['Technology', 'Retail', 'Financial Services'].includes(companyData.sector);
    return Math.min(companyData.ddosIncidents * (publicFacing ? 3 : 2), 100);
  }

  private generateRecommendations(companyData: any) {
    const recommendations = [];
    if (companyData.ddosIncidents > 50) recommendations.push('Implement advanced DDoS protection with cloud-based mitigation');
    if (companyData.vulnerabilities > 100) recommendations.push('Accelerate vulnerability management and patch deployment');
    if (companyData.riskScore > 90) recommendations.push('Consider cyber insurance and incident response plan review');
    if (['Financial Services', 'Telecommunications'].includes(companyData.sector)) recommendations.push('Implement industry-specific security frameworks (NIST, ISO 27001)');
    return recommendations;
  }

  private generateTrendAnalysis(companyData: any) {
    return {
      riskTrend: companyData.riskScore > 85 ? 'Increasing' : companyData.riskScore > 70 ? 'Stable' : 'Decreasing',
      vulnerabilityTrend: Math.random() > 0.5 ? 'Increasing' : 'Decreasing',
      incidentFrequency: companyData.ddosIncidents > 40 ? 'High' : companyData.ddosIncidents > 20 ? 'Medium' : 'Low',
      lastIncidentDays: Math.floor((new Date().getTime() - new Date(companyData.lastIncident).getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}