import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVisualizationCleanup } from './memory-management';

// Enhanced Geographic Intelligence with Leaflet Integration
class EnhancedGeographicIntelligence {
  constructor(apiOrchestrator) {
    this.api = apiOrchestrator;
    this.countryThreatLevels = new Map();
    this.asnDatabase = new Map();
    this.geoFences = new Map();
    this.threatClusters = new Map();
  }

  // Main IP geolocation and threat analysis
  async analyzeIPGeographics(ips) {
    const results = {};
    const batchSize = 10; // Process in batches to avoid rate limits
    
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
        
        // Small delay between batches
        if (i + batchSize < ips.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Batch processing failed:', error);
      }
    }
    
    return results;
  }

  // Individual IP analysis
  async analyzeIPLocation(ip) {
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

      // Update internal databases
      this.updateASNDatabase(analysis);
      this.updateCountryThreatLevels(analysis);
      
      return analysis;
    } catch (error) {
      console.error(`IP analysis failed for ${ip}:`, error);
      return {
        ip,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Calculate threat level based on multiple factors
  calculateThreatLevel(ipData) {
    let score = 0;
    const factors = [];

    // Country-based scoring
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    const mediumRiskCountries = ['PK', 'BD', 'VN', 'IN'];
    
    if (highRiskCountries.includes(ipData.country)) {
      score += 40;
      factors.push('High-risk country');
    } else if (mediumRiskCountries.includes(ipData.country)) {
      score += 20;
      factors.push('Medium-risk country');
    }

    // ASN/Organization based scoring
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

    // Historical threat data (simulated)
    const historicalRisk = this.getHistoricalThreatScore(ipData.country);
    score += historicalRisk;
    if (historicalRisk > 0) {
      factors.push(`Historical activity: +${historicalRisk}`);
    }

    const level = score >= 70 ? 'Critical' : 
                  score >= 40 ? 'High' : 
                  score >= 20 ? 'Medium' : 'Low';

    return { level, score, factors };
  }

  // Identify risk factors
  identifyRiskFactors(ipData) {
    const risks = [];
    
    // Network-based risks
    if (ipData.asn) {
      const asnData = this.asnDatabase.get(ipData.asn);
      if (asnData?.suspiciousActivity > 5) {
        risks.push({
          type: 'network',
          description: 'ASN has history of malicious activity',
          severity: 'high'
        });
      }
    }

    // Geographic risks
    if (ipData.country && this.countryThreatLevels.get(ipData.country) > 0.7) {
      risks.push({
        type: 'geographic',
        description: 'Country has elevated threat activity',
        severity: 'medium'
      });
    }

    // Infrastructure risks
    if (ipData.org?.toLowerCase().includes('residential')) {
      risks.push({
        type: 'infrastructure',
        description: 'Residential IP used for attacks',
        severity: 'medium'
      });
    }

    return risks;
  }

  // Check geofence violations
  checkGeoFences(ipData) {
    const violations = [];
    
    for (const [name, fence] of this.geoFences.entries()) {
      if (this.isWithinGeoFence(ipData, fence)) {
        violations.push({
          fence: name,
          type: fence.type,
          action: fence.action,
          severity: fence.severity
        });
      }
    }
    
    return violations;
  }

  // Identify threat clusters
  identifyThreatClusters(ipData) {
    const clusters = [];
    
    // Check ASN-based clusters
    if (ipData.asn) {
      const asnCluster = this.threatClusters.get(`asn:${ipData.asn}`);
      if (asnCluster) {
        clusters.push({
          type: 'asn',
          id: ipData.asn,
          confidence: asnCluster.confidence,
          threatCount: asnCluster.threatCount
        });
      }
    }

    // Check geographic clusters
    const geoKey = `${ipData.country}:${ipData.city}`;
    const geoCluster = this.threatClusters.get(`geo:${geoKey}`);
    if (geoCluster) {
      clusters.push({
        type: 'geographic',
        location: geoKey,
        confidence: geoCluster.confidence,
        threatCount: geoCluster.threatCount
      });
    }

    return clusters;
  }

  // Update internal databases
  updateASNDatabase(analysis) {
    if (!analysis.network.asn) return;
    
    const existing = this.asnDatabase.get(analysis.network.asn) || {
      asn: analysis.network.asn,
      org: analysis.network.org,
      threatCount: 0,
      suspiciousActivity: 0,
      countries: new Set(),
      lastSeen: null
    };

    existing.threatCount++;
    existing.countries.add(analysis.location.country);
    existing.lastSeen = Date.now();
    
    if (analysis.threat.level === 'Critical' || analysis.threat.level === 'High') {
      existing.suspiciousActivity++;
    }

    this.asnDatabase.set(analysis.network.asn, existing);
  }

  updateCountryThreatLevels(analysis) {
    const country = analysis.location.country;
    if (!country || country === 'Unknown') return;
    
    const existing = this.countryThreatLevels.get(country) || 0;
    const increment = analysis.threat.level === 'Critical' ? 0.1 : 
                     analysis.threat.level === 'High' ? 0.05 : 0.01;
    
    this.countryThreatLevels.set(country, Math.min(existing + increment, 1.0));
  }

  // Geofencing functionality
  createGeoFence(name, config) {
    this.geoFences.set(name, {
      name,
      type: config.type, // 'country', 'region', 'circle', 'polygon'
      parameters: config.parameters,
      action: config.action, // 'alert', 'block', 'monitor'
      severity: config.severity, // 'low', 'medium', 'high', 'critical'
      created: Date.now(),
      enabled: true
    });
  }

  isWithinGeoFence(ipData, fence) {
    switch (fence.type) {
      case 'country':
        return fence.parameters.countries.includes(ipData.country);
      case 'region':
        return fence.parameters.regions.includes(ipData.region);
      case 'circle':
        return this.isWithinCircle(ipData.coordinates, fence.parameters);
      case 'polygon':
        return this.isWithinPolygon(ipData.coordinates, fence.parameters);
      default:
        return false;
    }
  }

  isWithinCircle(coords, circleParams) {
    if (!coords.lat || !coords.lng) return false;
    
    const distance = this.calculateDistance(
      coords.lat, coords.lng,
      circleParams.centerLat, circleParams.centerLng
    );
    
    return distance <= circleParams.radius;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get historical threat score (simplified)
  getHistoricalThreatScore(country) {
    const threatHistory = {
      'CN': 25, 'RU': 30, 'KP': 35, 'IR': 20,
      'PK': 15, 'BD': 10, 'VN': 12, 'IN': 8
    };
    return threatHistory[country] || 0;
  }

  // Analytics and reporting
  generateThreatReport() {
    const report = {
      timestamp: Date.now(),
      summary: {
        totalASNs: this.asnDatabase.size,
        threatCountries: Array.from(this.countryThreatLevels.keys()).length,
        activeFences: Array.from(this.geoFences.values()).filter(f => f.enabled).length,
        threatClusters: this.threatClusters.size
      },
      topThreatCountries: this.getTopThreatCountries(10),
      topMaliciousASNs: this.getTopMaliciousASNs(10),
      recentAlerts: this.getRecentGeoFenceAlerts(50)
    };

    return report;
  }

  getTopThreatCountries(limit) {
    return Array.from(this.countryThreatLevels.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([country, level]) => ({
        country,
        threatLevel: level,
        percentage: Math.round(level * 100)
      }));
  }

  getTopMaliciousASNs(limit) {
    return Array.from(this.asnDatabase.values())
      .sort((a, b) => b.suspiciousActivity - a.suspiciousActivity)
      .slice(0, limit)
      .map(asn => ({
        asn: asn.asn,
        org: asn.org,
        suspiciousActivity: asn.suspiciousActivity,
        threatCount: asn.threatCount,
        countries: Array.from(asn.countries)
      }));
  }

  getRecentGeoFenceAlerts(limit) {
    // This would typically come from a persistent store
    // For now, return empty array as this is real-time data
    return [];
  }
}

// Leaflet Map Integration Component
const LeafletThreatMap = ({ 
  threatData = [], 
  geoFences = [], 
  height = 500,
  theme,
  onThreatClick = null,
  onMapClick = null 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { events, datasets } = useVisualizationCleanup();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Leaflet is available (would need to be loaded via CDN)
    if (typeof window.L === 'undefined') {
      setError('Leaflet library not loaded. Please include Leaflet CSS and JS.');
      setIsLoading(false);
      return;
    }

    try {
      // Create map instance
      const map = window.L.map(mapRef.current, {
        center: [20, 0], // Center on world
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;

      // Store in datasets for cleanup
      datasets.addDataset('leaflet_map', { map, markers: [] }, {
        priority: 'high',
        onEvict: (data) => {
          console.log('Cleaning up Leaflet map');
          data.markers.forEach(marker => data.map.removeLayer(marker));
          data.map.remove();
        }
      });

      // Add event listeners
      const mapClickHandler = (e) => {
        if (onMapClick) {
          onMapClick({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            originalEvent: e
          });
        }
      };

      map.on('click', mapClickHandler);

      // Add cleanup for event listeners
      events.addEventListener(map, 'click', mapClickHandler);

      setIsLoading(false);
    } catch (err) {
      console.error('Map initialization failed:', err);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  }, [datasets, events, onMapClick]);

  // Update threat markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading || error) return;

    const map = mapInstanceRef.current;
    const L = window.L;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    threatData.forEach(threat => {
      if (!threat.location?.coordinates?.lat || !threat.location?.coordinates?.lng) {
        return;
      }

      const { lat, lng } = threat.location.coordinates;
      
      // Create marker with color based on threat level
      const markerColor = getThreatColor(threat.threat?.level);
      const markerSize = getThreatSize(threat.threat?.level);

      const marker = L.circleMarker([lat, lng], {
        radius: markerSize,
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.6,
        weight: 2
      });

      // Create popup content
      const popupContent = createThreatPopup(threat);
      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        if (onThreatClick) {
          onThreatClick(threat);
        }
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Update datasets
    const mapData = datasets.getDataset('leaflet_map');
    if (mapData) {
      mapData.markers = markersRef.current;
    }

  }, [threatData, isLoading, error, datasets, onThreatClick]);

  // Add geofences
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading || error) return;

    const map = mapInstanceRef.current;
    const L = window.L;

    // Add geofence visualization
    geoFences.forEach(fence => {
      if (fence.type === 'circle' && fence.parameters) {
        const circle = L.circle(
          [fence.parameters.centerLat, fence.parameters.centerLng],
          {
            radius: fence.parameters.radius * 1000, // Convert km to meters
            color: getFenceColor(fence.severity),
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5'
          }
        );

        circle.bindPopup(`
          <strong>Geofence: ${fence.name}</strong><br>
          Type: ${fence.type}<br>
          Action: ${fence.action}<br>
          Severity: ${fence.severity}
        `);

        circle.addTo(map);
      }
    });

  }, [geoFences, isLoading, error]);

  // Helper functions
  const getThreatColor = (level) => {
    switch (level) {
      case 'Critical': return '#e74c3c';
      case 'High': return '#f39c12';
      case 'Medium': return '#f1c40f';
      case 'Low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getThreatSize = (level) => {
    switch (level) {
      case 'Critical': return 12;
      case 'High': return 10;
      case 'Medium': return 8;
      case 'Low': return 6;
      default: return 5;
    }
  };

  const getFenceColor = (severity) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const createThreatPopup = (threat) => {
    return `
      <div style="min-width: 200px;">
        <strong>IP: ${threat.ip}</strong><br>
        <strong>Location:</strong> ${threat.location?.city}, ${threat.location?.countryName}<br>
        <strong>Threat Level:</strong> <span style="color: ${getThreatColor(threat.threat?.level)};">${threat.threat?.level}</span><br>
        <strong>ASN:</strong> ${threat.network?.asn || 'Unknown'}<br>
        <strong>Organization:</strong> ${threat.network?.org || 'Unknown'}<br>
        ${threat.threat?.riskFactors?.length > 0 ? 
          `<strong>Risk Factors:</strong><br>${threat.threat.riskFactors.map(r => `• ${r.description}`).join('<br>')}` : ''
        }
      </div>
    `;
  };

  if (error) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '2px dashed #ddd',
        borderRadius: '8px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🗺️ Map Error</div>
          <div>{error}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Please ensure Leaflet library is loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          border: `2px solid ${theme?.cream || '#f0f0f0'}`,
          borderRadius: '8px'
        }} 
      />
      
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🌍</div>
            <div>Loading map...</div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px' }}>Threat Levels</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e74c3c' }}></div>
          <span>Critical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f39c12' }}></div>
          <span>High</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f1c40f' }}></div>
          <span>Medium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#27ae60' }}></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
};

// Geographic Intelligence Dashboard Component
const GeographicIntelligenceDashboard = ({ theme, apiOrchestrator }) => {
  const [geoIntel] = useState(() => new EnhancedGeographicIntelligence(apiOrchestrator));
  const [threatData, setThreatData] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [ipInput, setIpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threatReport, setThreatReport] = useState(null);

  // Sample geofences
  const geoFences = [
    {
      name: 'High-Risk Region',
      type: 'circle',
      parameters: {
        centerLat: 55.7558,
        centerLng: 37.6176,
        radius: 500 // km
      },
      action: 'alert',
      severity: 'high'
    }
  ];

  // Analyze IP addresses
  const analyzeIPs = useCallback(async () => {
    if (selectedIPs.length === 0) return;
    
    setLoading(true);
    try {
      const results = await geoIntel.analyzeIPGeographics(selectedIPs);
      const threatArray = Object.values(results).filter(result => !result.error);
      setThreatData(threatArray);
      
      // Generate threat report
      const report = geoIntel.generateThreatReport();
      setThreatReport(report);
    } catch (error) {
      console.error('IP analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedIPs, geoIntel]);

  // Add IP to analysis list
  const addIP = useCallback(() => {
    if (ipInput.trim() && !selectedIPs.includes(ipInput.trim())) {
      setSelectedIPs(prev => [...prev, ipInput.trim()]);
      setIpInput('');
    }
  }, [ipInput, selectedIPs]);

  // Remove IP from list
  const removeIP = useCallback((ip) => {
    setSelectedIPs(prev => prev.filter(i => i !== ip));
    setThreatData(prev => prev.filter(t => t.ip !== ip));
  }, []);

  // Add sample IPs for demonstration
  const addSampleIPs = useCallback(() => {
    const samples = [
      '185.220.101.182', // Russia
      '104.21.34.17',    // US
      '45.142.212.126',  // Romania
      '203.0.113.100',   // Reserved
      '8.8.8.8'          // Google DNS
    ];
    setSelectedIPs(prev => [...new Set([...prev, ...samples])]);
  }, []);

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
          Geographic Intelligence Platform
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Advanced IP geolocation analysis with threat correlation and interactive mapping
        </p>
      </div>

      {/* IP Input Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`
      }}>
        <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
          IP Address Analysis
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter IP address (e.g., 192.168.1.1)"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIP()}
            style={{
              flex: 1,
              padding: '12px',
              border: `2px solid ${theme.cream}`,
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={addIP}
            style={{
              background: theme.accent,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Add IP
          </button>
          <button
            onClick={addSampleIPs}
            style={{
              background: theme.primary,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Add Samples
          </button>
        </div>

        {/* IP List */}
        {selectedIPs.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: theme.primary, marginBottom: '12px' }}>
              Selected IPs ({selectedIPs.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedIPs.map(ip => (
                <div
                  key={ip}
                  style={{
                    background: theme.cream,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>{ip}</span>
                  <button
                    onClick={() => removeIP(ip)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={analyzeIPs}
          disabled={selectedIPs.length === 0 || loading}
          style={{
            background: loading ? '#95a5a6' : `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Analyzing...' : `Analyze ${selectedIPs.length} IPs`}
        </button>
      </div>

      {/* Threat Map */}
      {threatData.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
          border: `2px solid ${theme.cream}`,
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ color: theme.primary, marginBottom: '20px', textAlign: 'center' }}>
            Global Threat Intelligence Map
          </h3>
          
          <LeafletThreatMap
            threatData={threatData}
            geoFences={geoFences}
            height={500}
            theme={theme}
            onThreatClick={(threat) => console.log('Threat clicked:', threat)}
          />
        </div>
      )}

      {/* Threat Report */}
      {threatReport && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
          border: `2px solid ${theme.cream}`,
          padding: '24px'
        }}>
          <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
            Threat Intelligence Report
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px'
          }}>
            {/* Summary Stats */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: theme.primary, marginBottom: '16px' }}>Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
                    {threatReport.summary.totalASNs}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Total ASNs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
                    {threatReport.summary.threatCountries}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Countries</div>
                </div>
              </div>
            </div>

            {/* Top Threat Countries */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: theme.primary, marginBottom: '16px' }}>Top Threat Countries</h4>
              {threatReport.topThreatCountries.slice(0, 5).map((country, index) => (
                <div key={country.country} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  padding: '6px 0'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{country.country}</span>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: '600',
                    color: country.percentage > 50 ? '#e74c3c' : country.percentage > 25 ? '#f39c12' : '#27ae60'
                  }}>
                    {country.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { 
  EnhancedGeographicIntelligence, 
  LeafletThreatMap, 
  GeographicIntelligenceDashboard 
};