import React, { useState, useEffect } from 'react';
import { BarChart3, Shield, Target, TrendingUp, Database, Eye, Network, Zap, AlertTriangle, Users, Globe, Activity, Search, Filter, Download, RefreshCw, Calendar, MapPin, Code2, Cpu } from 'lucide-react';

// Theme Colors
const theme = {
  primary: '#454545',
  accent: '#FF6000', 
  lightAccent: '#FFA559',
  cream: '#FFE6C7',
  dark: '#2A2A2A',
  light: '#F8F8F8'
};

// Threat Intelligence Platform Component
const ThreatIntelligencePlatform = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedThreatActor, setSelectedThreatActor] = useState('mirai');
  const [timeRange, setTimeRange] = useState('30d');
  const [attackFilter, setAttackFilter] = useState('all');

  // Threat actor profiles
  const threatActors = {
    mirai: {
      name: 'Mirai Botnet',
      category: 'Botnet Operation',
      firstSeen: '2016-08-01',
      status: 'Active',
      severity: 'Critical',
      targetTypes: ['IoT Devices', 'Routers', 'Cameras'],
      attackMethods: ['TCP Flood', 'UDP Flood', 'HTTP Flood'],
      peakBotSize: 600000,
      countries: ['Global'],
      attribution: 'Cybercriminal Groups',
      description: 'Large-scale IoT botnet targeting vulnerable devices for DDoS attacks',
      recentActivity: 'High',
      color: '#e74c3c'
    },
    fancy_bear: {
      name: 'Fancy Bear (APT28)',
      category: 'Nation-State',
      firstSeen: '2007-01-01',
      status: 'Active',
      severity: 'High',
      targetTypes: ['Government', 'Military', 'Media'],
      attackMethods: ['Spear Phishing', 'DDoS', 'Data Exfiltration'],
      peakBotSize: 50000,
      countries: ['Russia'],
      attribution: 'Russian Military Intelligence (GRU)',
      description: 'Advanced persistent threat group with sophisticated DDoS capabilities',
      recentActivity: 'Medium',
      color: '#8e44ad'
    },
    lazarus: {
      name: 'Lazarus Group',
      category: 'Nation-State',
      firstSeen: '2009-01-01',
      status: 'Active',
      severity: 'High',
      targetTypes: ['Financial', 'Cryptocurrency', 'Infrastructure'],
      attackMethods: ['DDoS', 'Banking Trojans', 'Wiper Attacks'],
      peakBotSize: 100000,
      countries: ['North Korea'],
      attribution: 'North Korean State-Sponsored',
      description: 'Financially motivated group with destructive DDoS attack capabilities',
      recentActivity: 'High',
      color: '#f39c12'
    },
    anonymous: {
      name: 'Anonymous Collective',
      category: 'Hacktivist',
      firstSeen: '2003-01-01',
      status: 'Active',
      severity: 'Medium',
      targetTypes: ['Government', 'Corporations', 'Organizations'],
      attackMethods: ['DDoS', 'Website Defacement', 'Data Leaks'],
      peakBotSize: 200000,
      countries: ['Global'],
      attribution: 'Decentralized Hacktivist Network',
      description: 'Loose collective of hacktivists conducting coordinated DDoS operations',
      recentActivity: 'Medium',
      color: '#27ae60'
    }
  };

  // IP Intelligence data
  const ipIntelligence = [
    {
      ip: '185.220.101.182',
      country: 'Russia',
      city: 'Moscow',
      asn: 'AS13335',
      provider: 'Cloudflare',
      reputation: 'Malicious',
      firstSeen: '2024-01-15',
      lastSeen: '2024-02-28',
      attackCount: 1247,
      targetedSectors: ['Finance', 'Government'],
      associatedActors: ['Fancy Bear'],
      confidence: 95,
      threatTypes: ['Botnet C&C', 'DDoS Source']
    },
    {
      ip: '104.21.34.17',
      country: 'United States',
      city: 'San Francisco',
      asn: 'AS13335',
      provider: 'Cloudflare',
      reputation: 'Suspicious',
      firstSeen: '2024-02-01',
      lastSeen: '2024-02-25',
      attackCount: 423,
      targetedSectors: ['Technology', 'E-commerce'],
      associatedActors: ['Unknown'],
      confidence: 72,
      threatTypes: ['DDoS Source', 'Scanning']
    },
    {
      ip: '45.142.212.126',
      country: 'Romania',
      city: 'Bucharest',
      asn: 'AS60781',
      provider: 'LeaseWeb',
      reputation: 'Malicious',
      firstSeen: '2024-01-08',
      lastSeen: '2024-02-20',
      attackCount: 856,
      targetedSectors: ['Gaming', 'Media'],
      associatedActors: ['Mirai'],
      confidence: 88,
      threatTypes: ['Botnet Member', 'DDoS Source']
    }
  ];

  // Botnet analysis data
  const botnetData = {
    totalBotnets: 847,
    activeBotnets: 234,
    compromisedDevices: 2340000,
    topBotnets: [
      {
        name: 'Mirai',
        size: 600000,
        growth: '+15%',
        activity: 'High',
        primaryTargets: 'IoT Devices',
        avgAttackSize: '1.2 Tbps'
      },
      {
        name: 'Emotet',
        size: 400000,
        growth: '+8%',
        activity: 'Medium',
        primaryTargets: 'Windows PCs',
        avgAttackSize: '800 Gbps'
      },
      {
        name: 'Conficker',
        size: 300000,
        growth: '-5%',
        activity: 'Low',
        primaryTargets: 'Legacy Systems',
        avgAttackSize: '600 Gbps'
      }
    ]
  };

  // Attack clustering data
  const attackClusters = [
    {
      id: 'cluster-001',
      name: 'IoT Amplification Campaign',
      similarity: 94,
      attackCount: 156,
      timeframe: 'Last 30 days',
      characteristics: [
        'NTP amplification vectors',
        'IoT device exploitation',
        'Peak traffic 500+ Gbps',
        'Duration 2-4 hours'
      ],
      confidence: 'High',
      relatedActors: ['Mirai', 'Unknown'],
      geographicSpread: 'Global',
      evolutionStage: 'Mature'
    },
    {
      id: 'cluster-002', 
      name: 'Financial Sector Targeting',
      similarity: 87,
      attackCount: 89,
      timeframe: 'Last 45 days',
      characteristics: [
        'Application layer attacks',
        'Banking infrastructure focus',
        'Coordinated multi-vector approach',
        'Duration 6-12 hours'
      ],
      confidence: 'Medium',
      relatedActors: ['Lazarus', 'Unknown'],
      geographicSpread: 'Regional',
      evolutionStage: 'Evolving'
    },
    {
      id: 'cluster-003',
      name: 'Government Infrastructure Disruption', 
      similarity: 91,
      attackCount: 67,
      timeframe: 'Last 60 days',
      characteristics: [
        'TCP SYN flood attacks',
        'Government websites targeted',
        'Political event correlation',
        'Duration 1-3 hours'
      ],
      confidence: 'High',
      relatedActors: ['Anonymous', 'Fancy Bear'],
      geographicSpread: 'Targeted',
      evolutionStage: 'Active'
    }
  ];

  // Predictive threat modeling
  const threatPredictions = {
    nextWeek: {
      probability: 85,
      expectedTargets: ['Financial Services', 'E-commerce'],
      predictedMethods: ['HTTP Flood', 'DNS Amplification'],
      confidence: 'High',
      recommendation: 'Increase monitoring on financial sector infrastructure'
    },
    nextMonth: {
      probability: 72,
      expectedTargets: ['IoT Infrastructure', 'Cloud Services'],
      predictedMethods: ['UDP Flood', 'Botnet Coordination'],
      confidence: 'Medium',
      recommendation: 'Implement IoT device security measures'
    },
    nextQuarter: {
      probability: 68,
      expectedTargets: ['Critical Infrastructure', 'Government'],
      predictedMethods: ['Multi-vector Attacks', 'AI-Enhanced DDoS'],
      confidence: 'Medium',
      recommendation: 'Prepare for advanced persistent threats'
    }
  };

  const intelligenceSections = [
    { id: 'overview', name: 'Intelligence Overview', icon: Eye },
    { id: 'actors', name: 'Threat Actors', icon: Users },
    { id: 'ips', name: 'IP Intelligence', icon: Globe },
    { id: 'botnets', name: 'Botnet Analysis', icon: Network },
    { id: 'clustering', name: 'Attack Clustering', icon: Target },
    { id: 'predictions', name: 'Threat Predictions', icon: TrendingUp }
  ];

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
          Threat Intelligence Platform
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Advanced threat intelligence and actor analysis for comprehensive DDoS threat understanding and prediction
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px',
        marginBottom: '40px'
      }}>
        {intelligenceSections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})` : 'white',
                color: isActive ? 'white' : theme.primary,
                border: isActive ? 'none' : `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Icon size={20} style={{ marginBottom: '8px' }} />
              <div>{section.name}</div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        overflow: 'hidden'
      }}>
        {/* Intelligence Overview */}
        {activeSection === 'overview' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              DDoS Threat Intelligence Overview
            </h2>
            
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10)`,
                border: `2px solid ${theme.accent}40`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.accent }}>2,341</div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Active Threats</div>
                <div style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: '600' }}>↑ 12% this month</div>
              </div>
              
              <div style={{
                background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}10)`,
                border: `2px solid ${theme.primary}40`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.primary }}>847</div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Known Botnets</div>
                <div style={{ fontSize: '0.8rem', color: '#f39c12', fontWeight: '600' }}>234 currently active</div>
              </div>

              <div style={{
                background: `linear-gradient(135deg, #e74c3c20, #e74c3c10)`,
                border: `2px solid #e74c3c40`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#e74c3c' }}>156</div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>High-Risk IPs</div>
                <div style={{ fontSize: '0.8rem', color: '#e74c3c', fontWeight: '600' }}>Real-time tracking</div>
              </div>

              <div style={{
                background: `linear-gradient(135deg, #27ae6020, #27ae6010)`,
                border: `2px solid #27ae6040`,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#27ae60' }}>92%</div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '8px' }}>Detection Accuracy</div>
                <div style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: '600' }}>ML-enhanced analysis</div>
              </div>
            </div>

            {/* Threat Landscape Summary */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px', textAlign: 'center' }}>
                Current Threat Landscape
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <h4 style={{ color: theme.primary, marginBottom: '12px', fontSize: '1.1rem' }}>
                    Top Threat Categories
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Botnet Operations</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>47%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Nation-State</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>28%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Hacktivist</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>25%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: theme.primary, marginBottom: '12px', fontSize: '1.1rem' }}>
                    Geographic Distribution
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Global/Distributed</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>42%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Asia-Pacific</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>31%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>Eastern Europe</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.accent }}>27%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: theme.primary, marginBottom: '12px', fontSize: '1.1rem' }}>
                    Attack Trends
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      background: '#27ae6020',
                      color: '#27ae60',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      ↑ IoT targeting increased 34%
                    </div>
                    <div style={{
                      background: '#f39c1220',
                      color: '#f39c12',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      → Multi-vector attacks stable
                    </div>
                    <div style={{
                      background: '#e74c3c20',
                      color: '#e74c3c',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      ↑ AI-enhanced techniques +18%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence Sources */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
              borderRadius: '16px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ color: theme.cream, marginBottom: '20px', fontSize: '1.5rem' }}>
                Intelligence Sources & Coverage
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>47</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Threat Feeds</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>24/7</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Monitoring</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>156</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Countries</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>98.7%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Coverage</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Threat Actors */}
        {activeSection === 'actors' && (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: theme.primary, fontSize: '2rem', margin: 0 }}>
                Threat Actor Intelligence
              </h2>
              <select
                value={selectedThreatActor}
                onChange={(e) => setSelectedThreatActor(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {Object.entries(threatActors).map(([key, actor]) => (
                  <option key={key} value={key}>{actor.name}</option>
                ))}
              </select>
            </div>

            {/* Selected Actor Profile */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', align: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                  background: threatActors[selectedThreatActor].color,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {threatActors[selectedThreatActor].name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: theme.primary, fontSize: '1.8rem', margin: '0 0 8px' }}>
                    {threatActors[selectedThreatActor].name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: threatActors[selectedThreatActor].color + '20',
                      color: threatActors[selectedThreatActor].color,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {threatActors[selectedThreatActor].category}
                    </span>
                    <span style={{
                      background: threatActors[selectedThreatActor].severity === 'Critical' ? '#e74c3c' : '#f39c12',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {threatActors[selectedThreatActor].severity}
                    </span>
                    <span style={{
                      background: '#27ae60',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {threatActors[selectedThreatActor].status}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
                    {threatActors[selectedThreatActor].description}
                  </p>
                </div>
              </div>

              {/* Actor Details Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{ color: theme.primary, marginBottom: '12px' }}>Attribution</h4>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                    {threatActors[selectedThreatActor].attribution}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    First seen: {threatActors[selectedThreatActor].firstSeen}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{ color: theme.primary, marginBottom: '12px' }}>Capabilities</h4>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Peak Bot Size: </span>
                    <span style={{ fontWeight: '600', color: theme.accent }}>
                      {threatActors[selectedThreatActor].peakBotSize.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Activity Level: </span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: threatActors[selectedThreatActor].recentActivity === 'High' ? '#e74c3c' : '#f39c12'
                    }}>
                      {threatActors[selectedThreatActor].recentActivity}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{ color: theme.primary, marginBottom: '12px' }}>Target Types</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {threatActors[selectedThreatActor].targetTypes.map((target, index) => (
                      <span key={index} style={{
                        background: '#f0f0f0',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        {target}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h4 style={{ color: theme.primary, marginBottom: '12px' }}>Attack Methods</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {threatActors[selectedThreatActor].attackMethods.map((method, index) => (
                      <span key={index} style={{
                        background: threatActors[selectedThreatActor].color + '20',
                        color: threatActors[selectedThreatActor].color,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IP Intelligence */}
        {activeSection === 'ips' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              IP Intelligence & Reputation Analysis
            </h2>

            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
                High-Risk IP Addresses
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>IP Address</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Location</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Reputation</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Attacks</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Associated Actor</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipIntelligence.map((ip, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: '600' }}>
                          {ip.ip}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{ip.country}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{ip.city}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: ip.reputation === 'Malicious' ? '#e74c3c' : '#f39c12',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {ip.reputation}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '600', color: theme.accent }}>
                          {ip.attackCount}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                          {ip.associatedActors.join(', ')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '40px',
                              height: '8px',
                              background: '#f0f0f0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${ip.confidence}%`,
                                height: '100%',
                                background: ip.confidence >= 90 ? '#27ae60' : ip.confidence >= 70 ? '#f39c12' : '#e74c3c',
                                borderRadius: '4px'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{ip.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Botnet Analysis */}
        {activeSection === 'botnets' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Botnet Analysis & Tracking
            </h2>

            {/* Botnet Overview Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'white',
                border: `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.accent }}>
                  {botnetData.totalBotnets}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Known Botnets</div>
              </div>
              <div style={{
                background: 'white',
                border: `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e74c3c' }}>
                  {botnetData.activeBotnets}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Currently Active</div>
              </div>
              <div style={{
                background: 'white',
                border: `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f39c12' }}>
                  {(botnetData.compromisedDevices / 1000000).toFixed(1)}M
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Compromised Devices</div>
              </div>
            </div>

            {/* Top Botnets */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
                Top Active Botnets
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px'
              }}>
                {botnetData.topBotnets.map((botnet, index) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: `2px solid ${theme.cream}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ color: theme.primary, margin: 0, fontSize: '1.2rem' }}>
                        {botnet.name}
                      </h4>
                      <span style={{
                        background: botnet.activity === 'High' ? '#e74c3c' : 
                                   botnet.activity === 'Medium' ? '#f39c12' : '#27ae60',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {botnet.activity}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Bot Count:</span>
                        <span style={{ fontWeight: '600', color: theme.accent }}>
                          {botnet.size.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Growth:</span>
                        <span style={{ 
                          fontWeight: '600',
                          color: botnet.growth.startsWith('+') ? '#27ae60' : '#e74c3c'
                        }}>
                          {botnet.growth}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Avg Attack Size:</span>
                        <span style={{ fontWeight: '600', color: theme.primary }}>
                          {botnet.avgAttackSize}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      background: theme.cream,
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
                        Primary Targets:
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.primary }}>
                        {botnet.primaryTargets}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attack Clustering */}
        {activeSection === 'clustering' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Attack Pattern Clustering & Recognition
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '24px'
            }}>
              {attackClusters.map((cluster, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = theme.lightAccent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = theme.cream;
                }}>
                  {/* Cluster Header */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ color: theme.primary, fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                        {cluster.name}
                      </h3>
                      <div style={{
                        background: cluster.similarity >= 90 ? '#27ae60' : cluster.similarity >= 80 ? '#f39c12' : '#e74c3c',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {cluster.similarity}% Match
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {cluster.attackCount} attacks
                      </span>
                      <span style={{
                        background: cluster.confidence === 'High' ? '#27ae6020' : '#f39c1220',
                        color: cluster.confidence === 'High' ? '#27ae60' : '#f39c12',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {cluster.confidence} Confidence
                      </span>
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Attack Characteristics:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cluster.characteristics.map((char, idx) => (
                        <div key={idx} style={{
                          background: '#f8f9fa',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          border: `1px solid ${theme.cream}`
                        }}>
                          • {char}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cluster Details */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      fontSize: '0.85rem',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <span style={{ color: '#666' }}>Timeframe: </span>
                        <span style={{ fontWeight: '600', color: theme.primary }}>{cluster.timeframe}</span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Evolution: </span>
                        <span style={{ fontWeight: '600', color: theme.primary }}>{cluster.evolutionStage}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: '#666' }}>Related Actors: </span>
                      <span style={{ fontWeight: '600', color: theme.accent }}>
                        {cluster.relatedActors.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Threat Predictions */}
        {activeSection === 'predictions' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Predictive Threat Modeling
            </h2>

            <div style={{
              background: `${theme.accent}10`,
              border: `2px solid ${theme.accent}30`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: theme.accent, marginBottom: '16px' }}>
                AI-Powered Threat Predictions
              </h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Our machine learning models analyze historical attack patterns, current threat intelligence, 
                and global events to predict future DDoS threats with high accuracy.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '24px'
            }}>
              {Object.entries(threatPredictions).map(([timeframe, prediction]) => (
                <div key={timeframe} style={{
                  background: 'white',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                      color: theme.primary, 
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                      textTransform: 'capitalize'
                    }}>
                      {timeframe.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: prediction.probability >= 80 ? '#e74c3c' : 
                                   prediction.probability >= 60 ? '#f39c12' : '#27ae60',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        {prediction.probability}%
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Probability</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Expected Targets:
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {prediction.expectedTargets.map((target, index) => (
                        <span key={index} style={{
                          background: `${theme.accent}20`,
                          color: theme.accent,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Predicted Methods:
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {prediction.predictedMethods.map((method, index) => (
                        <span key={index} style={{
                          background: '#f0f0f0',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Recommendation:
                    </h5>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                      {prediction.recommendation}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                      <span style={{ color: '#666' }}>Confidence Level: </span>
                      <span style={{ 
                        fontWeight: '600',
                        color: prediction.confidence === 'High' ? '#27ae60' : '#f39c12'
                      }}>
                        {prediction.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Model Information */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
              borderRadius: '16px',
              padding: '30px',
              color: 'white',
              textAlign: 'center',
              marginTop: '30px'
            }}>
              <h3 style={{ color: theme.cream, marginBottom: '20px', fontSize: '1.5rem' }}>
                Prediction Model Performance
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>87%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Accuracy</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>2.3M</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Training Samples</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>Daily</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Model Updates</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.cream }}>47</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Data Sources</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Attack Validation Methods Component
const AttackValidationMethods = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedFramework, setSelectedFramework] = useState('nist');
  const [timelinePeriod, setTimelinePeriod] = useState('modern');

  // Validation evolution timeline data
  const validationTimeline = {
    'early': {
      period: '1990s - Early 2000s',
      title: 'Manual Analysis Era',
      description: 'Basic network monitoring and manual log analysis',
      techniques: [
        'Log file examination',
        'Network traffic inspection',
        'Manual correlation',
        'Simple threshold detection'
      ],
      challenges: [
        'High false positive rates',
        'Slow detection times',
        'Limited scalability',
        'Manual expertise dependency'
      ],
      accuracy: 65,
      responseTime: '24-72 hours',
      automation: 15
    },
    'transition': {
      period: '2000s - 2010s',
      title: 'Automated Detection',
      description: 'Introduction of automated monitoring and signature-based detection',
      techniques: [
        'Signature-based detection',
        'Automated alerting',
        'Traffic pattern analysis',
        'Baseline establishment'
      ],
      challenges: [
        'Signature evasion',
        'Zero-day attacks',
        'High maintenance overhead',
        'Limited context awareness'
      ],
      accuracy: 78,
      responseTime: '1-6 hours',
      automation: 55
    },
    'modern': {
      period: '2010s - Present',
      title: 'AI-Driven Validation',
      description: 'Machine learning and behavioral analysis for advanced threat detection',
      techniques: [
        'Machine learning algorithms',
        'Behavioral analysis',
        'Multi-vector correlation',
        'Real-time analytics'
      ],
      challenges: [
        'Model training complexity',
        'Adversarial attacks',
        'Data quality requirements',
        'Explainability concerns'
      ],
      accuracy: 92,
      responseTime: '1-15 minutes',
      automation: 85
    },
    'emerging': {
      period: '2020s - Future',
      title: 'Quantum & Edge Validation',
      description: 'Next-generation validation with quantum computing and edge analytics',
      techniques: [
        'Quantum-enhanced detection',
        'Edge computing analysis',
        'Federated learning',
        'Autonomous response'
      ],
      challenges: [
        'Quantum algorithm development',
        'Edge resource constraints',
        'Privacy preservation',
        'Coordination complexity'
      ],
      accuracy: 98,
      responseTime: 'Sub-second',
      automation: 95
    }
  };

  // Industry validation frameworks
  const validationFrameworks = {
    nist: {
      name: 'NIST Cybersecurity Framework',
      organization: 'National Institute of Standards and Technology',
      focus: 'Comprehensive cybersecurity risk management',
      color: '#2c3e50',
      phases: [
        { name: 'Identify', description: 'Asset and risk identification', coverage: 'Baseline establishment' },
        { name: 'Protect', description: 'Safeguard implementation', coverage: 'Preventive controls' },
        { name: 'Detect', description: 'Anomaly and event detection', coverage: 'Attack validation' },
        { name: 'Respond', description: 'Response action planning', coverage: 'Incident response' },
        { name: 'Recover', description: 'Recovery and lessons learned', coverage: 'Post-incident analysis' }
      ],
      strengths: ['Comprehensive coverage', 'Industry adoption', 'Flexible implementation'],
      limitations: ['High complexity', 'Resource intensive', 'Generic approach']
    },
    iso27035: {
      name: 'ISO/IEC 27035',
      organization: 'International Organization for Standardization',
      focus: 'Information security incident management',
      color: '#8e44ad',
      phases: [
        { name: 'Prepare', description: 'Incident management preparation', coverage: 'Framework setup' },
        { name: 'Detect', description: 'Incident detection and reporting', coverage: 'Attack identification' },
        { name: 'Assess', description: 'Incident assessment and validation', coverage: 'Threat validation' },
        { name: 'Respond', description: 'Incident response activities', coverage: 'Mitigation actions' },
        { name: 'Learn', description: 'Lessons learned integration', coverage: 'Process improvement' }
      ],
      strengths: ['International standard', 'Detailed processes', 'Continuous improvement'],
      limitations: ['Complex implementation', 'Certification requirements', 'Update frequency']
    },
    mitre: {
      name: 'MITRE ATT&CK Framework',
      organization: 'MITRE Corporation',
      focus: 'Adversary tactics, techniques, and procedures',
      color: '#e67e22',
      phases: [
        { name: 'Reconnaissance', description: 'Information gathering', coverage: 'Pre-attack validation' },
        { name: 'Initial Access', description: 'Entry point establishment', coverage: 'Attack vector analysis' },
        { name: 'Impact', description: 'Mission or business process disruption', coverage: 'DDoS validation' },
        { name: 'Defense Evasion', description: 'Avoiding detection', coverage: 'Evasion techniques' },
        { name: 'Discovery', description: 'System and network exploration', coverage: 'Attack progression' }
      ],
      strengths: ['Tactical focus', 'Real-world mapping', 'Community driven'],
      limitations: ['Complexity for beginners', 'Overwhelming detail', 'Limited strategic guidance']
    },
    sans: {
      name: 'SANS Incident Response',
      organization: 'SANS Institute',
      focus: 'Practical incident response methodology',
      color: '#27ae60',
      phases: [
        { name: 'Preparation', description: 'Readiness and planning', coverage: 'Team and tools setup' },
        { name: 'Identification', description: 'Incident detection and validation', coverage: 'Attack confirmation' },
        { name: 'Containment', description: 'Threat containment strategies', coverage: 'Impact limitation' },
        { name: 'Eradication', description: 'Threat removal procedures', coverage: 'Attack elimination' },
        { name: 'Recovery', description: 'Service restoration processes', coverage: 'Business continuity' }
      ],
      strengths: ['Practical approach', 'Clear procedures', 'Training availability'],
      limitations: ['Limited customization', 'Commercial focus', 'Update dependencies']
    }
  };

  // Validation techniques comparison
  const validationTechniques = {
    automated: {
      name: 'Automated Validation',
      description: 'AI and machine learning-based validation systems',
      color: '#3498db',
      advantages: [
        'Real-time processing',
        'High scalability',
        'Consistent accuracy',
        'Reduced human error',
        '24/7 monitoring capability'
      ],
      disadvantages: [
        'High initial setup cost',
        'False positive potential',
        'Limited context awareness',
        'Signature dependency',
        'Maintenance complexity'
      ],
      accuracy: 88,
      speed: 'Milliseconds',
      cost: 'High initial, Low operational',
      scalability: 'Excellent',
      techniques: [
        'Statistical anomaly detection',
        'Machine learning classification',
        'Pattern recognition algorithms',
        'Behavioral baseline analysis',
        'Real-time traffic analysis'
      ]
    },
    manual: {
      name: 'Manual Validation',
      description: 'Expert-driven analysis and verification processes',
      color: '#e74c3c',
      advantages: [
        'Deep contextual analysis',
        'Complex pattern recognition',
        'Low false positive rates',
        'Adaptability to new threats',
        'Forensic investigation capability'
      ],
      disadvantages: [
        'Slow response times',
        'Limited scalability',
        'Human error potential',
        'High operational costs',
        'Expertise dependency'
      ],
      accuracy: 95,
      speed: 'Hours to days',
      cost: 'Low initial, High operational',
      scalability: 'Limited',
      techniques: [
        'Log file correlation',
        'Network forensics',
        'Threat hunting',
        'Incident reconstruction',
        'Expert system consultation'
      ]
    },
    hybrid: {
      name: 'Hybrid Validation',
      description: 'Combined automated and manual validation approaches',
      color: '#f39c12',
      advantages: [
        'Balanced accuracy and speed',
        'Reduced false positives',
        'Scalable with oversight',
        'Cost-effective approach',
        'Continuous improvement'
      ],
      disadvantages: [
        'Complex coordination',
        'Training requirements',
        'Tool integration challenges',
        'Process standardization needs',
        'Performance optimization'
      ],
      accuracy: 93,
      speed: 'Minutes to hours',
      cost: 'Medium initial and operational',
      scalability: 'Good',
      techniques: [
        'Automated screening + manual review',
        'Machine learning with expert validation',
        'Tiered response systems',
        'Risk-based prioritization',
        'Continuous feedback loops'
      ]
    }
  };

  // False positive reduction strategies
  const fpReductionStrategies = [
    {
      category: 'Baseline Establishment',
      description: 'Creating accurate behavioral baselines for normal network operations',
      techniques: [
        'Historical traffic analysis',
        'Business cycle correlation',
        'Seasonal adjustment models',
        'User behavior profiling'
      ],
      effectiveness: 85,
      complexity: 'Medium',
      timeframe: '2-4 weeks'
    },
    {
      category: 'Multi-Vector Correlation',
      description: 'Combining multiple detection methods for improved accuracy',
      techniques: [
        'Network flow analysis',
        'Application layer monitoring',
        'Infrastructure health checks',
        'Threat intelligence integration'
      ],
      effectiveness: 90,
      complexity: 'High',
      timeframe: '1-2 weeks'
    },
    {
      category: 'Contextual Analysis',
      description: 'Incorporating business context and environmental factors',
      techniques: [
        'Business impact assessment',
        'Time-based pattern analysis',
        'Geographic correlation',
        'Service dependency mapping'
      ],
      effectiveness: 88,
      complexity: 'High',
      timeframe: '3-6 weeks'
    },
    {
      category: 'Adaptive Thresholds',
      description: 'Dynamic threshold adjustment based on current conditions',
      techniques: [
        'Machine learning threshold optimization',
        'Statistical process control',
        'Anomaly score calibration',
        'Real-time baseline updates'
      ],
      effectiveness: 92,
      complexity: 'Very High',
      timeframe: '4-8 weeks'
    }
  ];

  const validationSections = [
    { id: 'overview', name: 'Validation Overview', icon: Eye },
    { id: 'evolution', name: 'Historical Evolution', icon: TrendingUp },
    { id: 'frameworks', name: 'Industry Frameworks', icon: Shield },
    { id: 'techniques', name: 'Validation Techniques', icon: Cpu },
    { id: 'false-positives', name: 'False Positive Reduction', icon: AlertTriangle },
    { id: 'monitoring', name: 'Real-time Monitoring', icon: Activity }
  ];

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
          Attack Validation Methods
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Understanding how DDoS attacks are verified and validated across different methodologies and frameworks
        </p>
      </div>

      {/* Section Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px',
        marginBottom: '40px'
      }}>
        {validationSections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})` : 'white',
                color: isActive ? 'white' : theme.primary,
                border: isActive ? 'none' : `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Icon size={20} style={{ marginBottom: '8px' }} />
              <div>{section.name}</div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        overflow: 'hidden'
      }}>
        {/* Validation Overview */}
        {activeSection === 'overview' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              DDoS Attack Validation Overview
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${theme.primary}10, ${theme.primary}05)`,
                border: `2px solid ${theme.primary}30`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: theme.primary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Eye size={24} />
                  What is Attack Validation?
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                  Attack validation is the process of verifying and confirming that a detected event represents a genuine DDoS attack rather than a false positive or benign traffic anomaly.
                </p>
                <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li>Confirmation of malicious intent</li>
                  <li>Impact assessment and severity scoring</li>
                  <li>Attack vector and methodology identification</li>
                  <li>Attribution and source analysis</li>
                </ul>
              </div>

              <div style={{
                background: `linear-gradient(135deg, ${theme.accent}10, ${theme.accent}05)`,
                border: `2px solid ${theme.accent}30`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: theme.accent, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={24} />
                  Why Validation Matters
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                  Proper validation prevents false alarms, ensures appropriate response allocation, and provides crucial intelligence for defense improvement.
                </p>
                <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li>Reduces false positive rates by 70-80%</li>
                  <li>Enables appropriate response prioritization</li>
                  <li>Improves threat intelligence quality</li>
                  <li>Supports forensic analysis and attribution</li>
                </ul>
              </div>

              <div style={{
                background: `linear-gradient(135deg, ${theme.lightAccent}10, ${theme.lightAccent}05)`,
                border: `2px solid ${theme.lightAccent}30`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: theme.lightAccent, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TrendingUp size={24} />
                  Modern Challenges
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                  Today's validation systems must handle sophisticated attacks, encrypted traffic, and massive scale while maintaining accuracy.
                </p>
                <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li>Encrypted traffic analysis limitations</li>
                  <li>AI-driven attack evolution</li>
                  <li>Cloud and hybrid infrastructure complexity</li>
                  <li>Real-time processing requirements</li>
                </ul>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
              borderRadius: '16px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ color: theme.cream, marginBottom: '24px', fontSize: '1.5rem' }}>
                Industry Validation Metrics
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>92%</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>Average Accuracy</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>15 min</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>Mean Response Time</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>8%</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>False Positive Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>85%</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>Automation Level</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Evolution */}
        {activeSection === 'evolution' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Evolution of DDoS Validation Techniques
            </h2>

            {/* Timeline Period Selector */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              marginBottom: '40px'
            }}>
              {Object.keys(validationTimeline).map(period => (
                <button
                  key={period}
                  onClick={() => setTimelinePeriod(period)}
                  style={{
                    background: timelinePeriod === period ? theme.accent : 'white',
                    color: timelinePeriod === period ? 'white' : theme.primary,
                    border: `2px solid ${timelinePeriod === period ? theme.accent : theme.cream}`,
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {validationTimeline[period].period}
                </button>
              ))}
            </div>

            {/* Selected Period Details */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ color: theme.primary, fontSize: '1.8rem', marginBottom: '8px' }}>
                  {validationTimeline[timelinePeriod].title}
                </h3>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '20px' }}>
                  {validationTimeline[timelinePeriod].description}
                </p>
                <div style={{ fontSize: '1rem', color: theme.accent, fontWeight: '600' }}>
                  {validationTimeline[timelinePeriod].period}
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '30px',
                marginBottom: '30px'
              }}>
                {/* Techniques */}
                <div>
                  <h4 style={{ color: theme.primary, marginBottom: '16px' }}>Key Techniques</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationTimeline[timelinePeriod].techniques.map((technique, index) => (
                      <div key={index} style={{
                        background: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cream}`,
                        fontSize: '0.9rem'
                      }}>
                        ✓ {technique}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenges */}
                <div>
                  <h4 style={{ color: theme.primary, marginBottom: '16px' }}>Main Challenges</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationTimeline[timelinePeriod].challenges.map((challenge, index) => (
                      <div key={index} style={{
                        background: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cream}`,
                        fontSize: '0.9rem'
                      }}>
                        ⚠ {challenge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px',
                background: 'white',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.accent }}>
                    {validationTimeline[timelinePeriod].accuracy}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Accuracy Rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: theme.accent }}>
                    {validationTimeline[timelinePeriod].responseTime}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Response Time</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.accent }}>
                    {validationTimeline[timelinePeriod].automation}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Automation</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Frameworks */}
        {activeSection === 'frameworks' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Industry Validation Frameworks
            </h2>

            {/* Framework Selector */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginBottom: '30px'
            }}>
              {Object.entries(validationFrameworks).map(([key, framework]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFramework(key)}
                  style={{
                    background: selectedFramework === key ? framework.color : 'white',
                    color: selectedFramework === key ? 'white' : framework.color,
                    border: `2px solid ${framework.color}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  {framework.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Selected Framework Details */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '30px'
            }}>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    background: validationFrameworks[selectedFramework].color,
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    {validationFrameworks[selectedFramework].name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ color: theme.primary, fontSize: '1.5rem', margin: 0 }}>
                      {validationFrameworks[selectedFramework].name}
                    </h3>
                    <p style={{ color: '#666', margin: '4px 0 0', fontSize: '1rem' }}>
                      {validationFrameworks[selectedFramework].organization}
                    </p>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {validationFrameworks[selectedFramework].focus}
                </p>
              </div>

              {/* Framework Phases */}
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: theme.primary, marginBottom: '20px' }}>Framework Phases</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px'
                }}>
                  {validationFrameworks[selectedFramework].phases.map((phase, index) => (
                    <div key={index} style={{
                      background: 'white',
                      border: `2px solid ${validationFrameworks[selectedFramework].color}30`,
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          background: validationFrameworks[selectedFramework].color,
                          color: 'white',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.9rem'
                        }}>
                          {index + 1}
                        </div>
                        <h5 style={{ color: theme.primary, margin: 0, fontSize: '1.1rem' }}>
                          {phase.name}
                        </h5>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                        {phase.description}
                      </p>
                      <div style={{
                        background: `${validationFrameworks[selectedFramework].color}15`,
                        color: validationFrameworks[selectedFramework].color,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {phase.coverage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths and Limitations */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '24px'
              }}>
                <div>
                  <h4 style={{ color: '#27ae60', marginBottom: '16px' }}>Strengths</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationFrameworks[selectedFramework].strengths.map((strength, index) => (
                      <div key={index} style={{
                        background: '#27ae6020',
                        color: '#27ae60',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        ✓ {strength}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ color: '#e74c3c', marginBottom: '16px' }}>Limitations</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {validationFrameworks[selectedFramework].limitations.map((limitation, index) => (
                      <div key={index} style={{
                        background: '#e74c3c20',
                        color: '#e74c3c',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        ⚠ {limitation}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Techniques Comparison */}
        {activeSection === 'techniques' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Validation Techniques Comparison
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '24px'
            }}>
              {Object.values(validationTechniques).map((technique, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: `2px solid ${technique.color}30`,
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {/* Technique Header */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                      color: technique.color, 
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        background: technique.color,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%'
                      }} />
                      {technique.name}
                    </h3>
                    <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
                      {technique.description}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: `${technique.color}15`,
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: technique.color }}>
                        {technique.accuracy}%
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Accuracy</div>
                    </div>
                    <div style={{
                      background: `${technique.color}15`,
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: technique.color }}>
                        {technique.scalability}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Scalability</div>
                    </div>
                  </div>

                  {/* Advantages */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Advantages:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {technique.advantages.slice(0, 3).map((advantage, idx) => (
                        <div key={idx} style={{
                          fontSize: '0.8rem',
                          color: '#27ae60',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: '#27ae60' }}>✓</span>
                          {advantage}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disadvantages */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Challenges:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {technique.disadvantages.slice(0, 3).map((disadvantage, idx) => (
                        <div key={idx} style={{
                          fontSize: '0.8rem',
                          color: '#e74c3c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: '#e74c3c' }}>⚠</span>
                          {disadvantage}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      fontSize: '0.9rem'
                    }}>
                      <div>
                        <span style={{ color: '#666' }}>Speed: </span>
                        <span style={{ fontWeight: '600', color: technique.color }}>{technique.speed}</span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Cost: </span>
                        <span style={{ fontWeight: '600', color: technique.color }}>{technique.cost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* False Positive Reduction */}
        {activeSection === 'false-positives' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              False Positive Reduction Strategies
            </h2>

            <div style={{
              background: `${theme.accent}10`,
              border: `2px solid ${theme.accent}30`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: theme.accent, marginBottom: '16px' }}>
                Why False Positive Reduction Matters
              </h3>
              <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                False positives in DDoS detection can lead to unnecessary mitigation actions, alert fatigue, 
                and reduced confidence in security systems. Modern organizations require validation accuracy above 90% 
                to maintain operational efficiency and trust in automated defense systems.
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px'
            }}>
              {fpReductionStrategies.map((strategy, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = theme.lightAccent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = theme.cream;
                }}>
                  {/* Strategy Header */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ color: theme.primary, fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                        {strategy.category}
                      </h3>
                      <div style={{
                        background: strategy.effectiveness >= 90 ? '#27ae60' : 
                                   strategy.effectiveness >= 85 ? '#f39c12' : '#e74c3c',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {strategy.effectiveness}%
                      </div>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {strategy.description}
                    </p>
                  </div>

                  {/* Techniques */}
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '12px' }}>
                      Implementation Techniques:
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {strategy.techniques.map((technique, idx) => (
                        <div key={idx} style={{
                          background: '#f8f9fa',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          border: `1px solid ${theme.cream}`
                        }}>
                          • {technique}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Implementation Details */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <span style={{ color: '#666' }}>Complexity: </span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: strategy.complexity === 'Low' ? '#27ae60' :
                                 strategy.complexity === 'Medium' ? '#f39c12' : '#e74c3c'
                        }}>
                          {strategy.complexity}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>Timeframe: </span>
                        <span style={{ fontWeight: '600', color: theme.accent }}>
                          {strategy.timeframe}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Monitoring */}
        {activeSection === 'monitoring' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              background: theme.accent,
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Activity size={32} color="white" />
            </div>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '16px' }}>
              Real-time Validation Monitoring
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
              Advanced real-time monitoring and validation systems for immediate threat response
            </p>
            
            <div style={{
              background: `${theme.cream}50`,
              border: `2px dashed ${theme.lightAccent}`,
              borderRadius: '16px',
              padding: '40px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '16px' }}>Advanced Monitoring Dashboard</h3>
              <p style={{ color: '#666', fontSize: '1rem', marginBottom: '20px' }}>
                Real-time validation monitoring with stream processing, edge analytics, 
                and predictive threat validation capabilities.
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>< 1s</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Detection Time</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>99.2%</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Accuracy Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>24/7</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Security Frameworks Integration Component
const SecurityFrameworks = () => {
  const [activeFramework, setActiveFramework] = useState('overview');
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [cvssCalculator, setCvssCalculator] = useState({
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    privilegesRequired: 'NONE',
    userInteraction: 'NONE',
    scope: 'UNCHANGED',
    confidentialityImpact: 'NONE',
    integrityImpact: 'NONE',
    availabilityImpact: 'HIGH'
  });

  // Framework data and configurations
  const frameworksData = {
    kev: {
      name: 'Known Exploited Vulnerabilities (KEV)',
      description: 'CISA catalog of vulnerabilities known to be actively exploited',
      icon: AlertTriangle,
      color: '#e74c3c',
      totalEntries: 1127,
      ddosRelated: 89,
      recentAdditions: 23
    },
    cwe: {
      name: 'Common Weakness Enumeration (CWE)',
      description: 'Categorization system for software security weaknesses',
      icon: Shield,
      color: '#9b59b6', 
      totalEntries: 933,
      ddosRelated: 47,
      topCategories: ['CWE-400', 'CWE-770', 'CWE-834']
    },
    cpe: {
      name: 'Common Platform Enumeration (CPE)',
      description: 'Structured naming scheme for IT systems and platforms',
      icon: Cpu,
      color: '#3498db',
      totalEntries: 890000,
      networkProducts: 45632,
      vulnerableProducts: 12890
    },
    cvss: {
      name: 'Common Vulnerability Scoring System (CVSS)',
      description: 'Standardized vulnerability severity scoring framework',
      icon: BarChart3,
      color: '#f39c12',
      averageScore: 7.2,
      criticalCount: 892,
      ddosAverageScore: 8.1
    }
  };

  // Mock DDoS-related CWE data
  const ddosCWEData = [
    {
      id: 'CWE-400',
      name: 'Uncontrolled Resource Consumption',
      description: 'The software does not properly control the allocation and maintenance of a limited resource',
      severity: 'HIGH',
      prevalence: 'Common',
      ddosRelevance: 95,
      examples: ['Memory exhaustion', 'CPU consumption', 'Bandwidth depletion'],
      mitigations: ['Rate limiting', 'Resource quotas', 'Input validation']
    },
    {
      id: 'CWE-770',
      name: 'Allocation of Resources Without Limits or Throttling',
      description: 'The software allocates a reusable resource or group of resources without proper limits',
      severity: 'HIGH', 
      prevalence: 'Common',
      ddosRelevance: 88,
      examples: ['Connection flooding', 'Memory allocation attacks', 'Thread exhaustion'],
      mitigations: ['Connection limits', 'Memory bounds', 'Throttling mechanisms']
    },
    {
      id: 'CWE-834',
      name: 'Excessive Iteration',
      description: 'The software performs an iteration or loop without sufficiently limiting iterations',
      severity: 'MEDIUM',
      prevalence: 'Uncommon', 
      ddosRelevance: 72,
      examples: ['Infinite loops', 'Algorithmic complexity attacks', 'Recursive calls'],
      mitigations: ['Loop bounds', 'Timeout mechanisms', 'Complexity analysis']
    },
    {
      id: 'CWE-672',
      name: 'Operation on a Resource after Expiration or Release',
      description: 'The software uses, accesses, or otherwise operates on a resource after expiration',
      severity: 'MEDIUM',
      prevalence: 'Uncommon',
      ddosRelevance: 65,
      examples: ['Use-after-free', 'Dangling pointers', 'Expired sessions'],
      mitigations: ['Resource lifecycle management', 'Automatic cleanup', 'Validation checks']
    },
    {
      id: 'CWE-730', 
      name: 'OWASP Top Ten 2004 Category A9 - Denial of Service',
      description: 'Weaknesses in this category are related to denial of service attacks',
      severity: 'HIGH',
      prevalence: 'Common',
      ddosRelevance: 100,
      examples: ['Service unavailability', 'Resource exhaustion', 'System crashes'],
      mitigations: ['Redundancy', 'Load balancing', 'DDoS protection services']
    }
  ];

  // Mock KEV data
  const kevDDoSEntries = [
    {
      cveId: 'CVE-2024-1234',
      vendor: 'Apache',
      product: 'HTTP Server',
      vulnerability: 'HTTP/2 Stream Multiplexing DoS',
      dateAdded: '2024-01-15',
      dueDate: '2024-02-15',
      requiredAction: 'Apply updates per vendor instructions',
      notes: 'Actively exploited in DDoS campaigns',
      cvssScore: 7.5,
      exploitStatus: 'Active'
    },
    {
      cveId: 'CVE-2024-5678', 
      vendor: 'Cisco',
      product: 'IOS XE',
      vulnerability: 'Memory Exhaustion via Malformed Packets',
      dateAdded: '2024-02-01',
      dueDate: '2024-03-01', 
      requiredAction: 'Apply security patch',
      notes: 'Used in volumetric attacks against routers',
      cvssScore: 8.2,
      exploitStatus: 'Active'
    },
    {
      cveId: 'CVE-2024-9012',
      vendor: 'Microsoft',
      product: 'IIS',
      vulnerability: 'HTTP Request Processing DoS',
      dateAdded: '2024-02-10',
      dueDate: '2024-03-10',
      requiredAction: 'Install security update',
      notes: 'Exploited via application layer attacks',
      cvssScore: 6.8,
      exploitStatus: 'Active'
    }
  ];

  // CVSS Score Calculator
  const calculateCVSSScore = () => {
    const calc = cvssCalculator;
    
    // Base Score calculation (simplified CVSS 3.1)
    const attackVectorScore = calc.attackVector === 'NETWORK' ? 0.85 : 
                             calc.attackVector === 'ADJACENT' ? 0.62 : 
                             calc.attackVector === 'LOCAL' ? 0.55 : 0.2;
    
    const attackComplexityScore = calc.attackComplexity === 'LOW' ? 0.77 : 0.44;
    const privilegesScore = calc.privilegesRequired === 'NONE' ? 0.85 : 
                           calc.privilegesRequired === 'LOW' ? 0.62 : 0.27;
    const userInteractionScore = calc.userInteraction === 'NONE' ? 0.85 : 0.62;
    
    const availabilityScore = calc.availabilityImpact === 'HIGH' ? 0.56 : 
                             calc.availabilityImpact === 'LOW' ? 0.22 : 0.0;
    const confidentialityScore = calc.confidentialityImpact === 'HIGH' ? 0.56 : 
                                calc.confidentialityImpact === 'LOW' ? 0.22 : 0.0;
    const integrityScore = calc.integrityImpact === 'HIGH' ? 0.56 : 
                          calc.integrityImpact === 'LOW' ? 0.22 : 0.0;
    
    const exploitability = 8.22 * attackVectorScore * attackComplexityScore * privilegesScore * userInteractionScore;
    const impact = 1 - ((1 - confidentialityScore) * (1 - integrityScore) * (1 - availabilityScore));
    
    const baseScore = impact === 0 ? 0 : Math.min(10, ((0.6 * impact) + (0.4 * exploitability) - 1.5) * 1.176);
    
    return Math.round(baseScore * 10) / 10;
  };

  const frameworks = [
    { id: 'overview', name: 'Framework Overview', icon: Globe },
    { id: 'kev', name: 'KEV Analysis', icon: AlertTriangle },
    { id: 'cwe', name: 'CWE Mapping', icon: Shield },
    { id: 'cpe', name: 'CPE Products', icon: Cpu },
    { id: 'cvss', name: 'CVSS Calculator', icon: BarChart3 },
    { id: 'correlation', name: 'Cross-Framework Analysis', icon: Network }
  ];

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
          Security Frameworks Integration
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Deep integration with KEV, CWE, CPE, and CVSS frameworks for comprehensive DDoS vulnerability analysis
        </p>
      </div>

      {/* Framework Navigation */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '40px'
      }}>
        {frameworks.map(framework => {
          const Icon = framework.icon;
          const isActive = activeFramework === framework.id;
          return (
            <button
              key={framework.id}
              onClick={() => setActiveFramework(framework.id)}
              style={{
                background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})` : 'white',
                color: isActive ? 'white' : theme.primary,
                border: isActive ? 'none' : `2px solid ${theme.cream}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <Icon size={20} style={{ marginBottom: '8px' }} />
              <div>{framework.name}</div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        overflow: 'hidden'
      }}>
        {/* Framework Overview */}
        {activeFramework === 'overview' && (
          <div style={{ padding: '40px' }}>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>
              Security Framework Ecosystem
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              {Object.entries(frameworksData).map(([key, framework]) => {
                const Icon = framework.icon;
                return (
                  <div key={key} style={{
                    background: `linear-gradient(135deg, ${framework.color}10, ${framework.color}05)`,
                    border: `2px solid ${framework.color}30`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveFramework(key)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${framework.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        background: framework.color,
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={24} color="white" />
                      </div>
                      <h3 style={{ margin: 0, color: theme.primary, fontSize: '1.2rem', fontWeight: '700' }}>
                        {framework.name.split('(')[0]}
                      </h3>
                    </div>
                    
                    <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
                      {framework.description}
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                      gap: '12px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: framework.color }}>
                          {key === 'kev' ? framework.totalEntries :
                           key === 'cwe' ? framework.totalEntries :
                           key === 'cpe' ? '890K' :
                           framework.averageScore}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {key === 'cvss' ? 'Avg Score' : 'Total'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: framework.color }}>
                          {key === 'kev' ? framework.ddosRelated :
                           key === 'cwe' ? framework.ddosRelated :
                           key === 'cpe' ? '45.6K' :
                           framework.criticalCount}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {key === 'cvss' ? 'Critical' : 'DDoS Related'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Integration Benefits */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
              borderRadius: '16px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ color: theme.cream, marginBottom: '20px', fontSize: '1.5rem' }}>
                Cross-Framework Intelligence
              </h3>
              <p style={{ marginBottom: '24px', fontSize: '1.1rem', opacity: 0.9 }}>
                Our platform correlates data across all major security frameworks to provide unprecedented insight into DDoS vulnerabilities
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.cream }}>2,341</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Cross-Referenced CVEs</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.cream }}>89%</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Correlation Accuracy</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.cream }}>24/7</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Real-time Updates</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KEV Analysis */}
        {activeFramework === 'kev' && (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
              <div style={{
                background: frameworksData.kev.color,
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={32} color="white" />
              </div>
              <div>
                <h2 style={{ color: theme.primary, fontSize: '2rem', margin: 0 }}>
                  Known Exploited Vulnerabilities (KEV)
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', margin: '8px 0 0' }}>
                  CISA catalog of actively exploited vulnerabilities with DDoS implications
                </p>
              </div>
            </div>

            {/* KEV Statistics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: '#e74c3c20',
                border: '2px solid #e74c3c40',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e74c3c' }}>
                  {frameworksData.kev.totalEntries}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>Total KEV Entries</div>
              </div>
              <div style={{
                background: '#e74c3c20',
                border: '2px solid #e74c3c40',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e74c3c' }}>
                  {frameworksData.kev.ddosRelated}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>DDoS Related</div>
              </div>
              <div style={{
                background: '#e74c3c20',
                border: '2px solid #e74c3c40',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e74c3c' }}>
                  {frameworksData.kev.recentAdditions}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>Added This Month</div>
              </div>
            </div>

            {/* KEV Entries Table */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
                Recent DDoS-Related KEV Entries
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>CVE ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Product</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Vulnerability</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>CVSS</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: theme.primary }}>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kevDDoSEntries.map((entry, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}>
                        <td style={{ padding: '12px', fontWeight: '600', color: theme.accent }}>
                          {entry.cveId}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{entry.vendor}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{entry.product}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', maxWidth: '200px' }}>
                          <div style={{ fontSize: '0.9rem' }}>{entry.vulnerability}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: entry.cvssScore >= 7 ? '#e74c3c' : entry.cvssScore >= 4 ? '#f39c12' : '#27ae60',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {entry.cvssScore}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: '#e74c3c20',
                            color: '#e74c3c',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {entry.exploitStatus}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>
                          {entry.dueDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CWE Mapping */}
        {activeFramework === 'cwe' && (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
              <div style={{
                background: frameworksData.cwe.color,
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={32} color="white" />
              </div>
              <div>
                <h2 style={{ color: theme.primary, fontSize: '2rem', margin: 0 }}>
                  Common Weakness Enumeration (CWE)
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', margin: '8px 0 0' }}>
                  Analysis of weakness patterns that enable DDoS attacks
                </p>
              </div>
            </div>

            {/* CWE-DDoS Relationship Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '24px'
            }}>
              {ddosCWEData.map((cwe, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: `2px solid ${cwe.severity === 'HIGH' ? '#e74c3c40' : cwe.severity === 'MEDIUM' ? '#f39c1240' : '#27ae6040'}`,
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {/* CWE Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: theme.primary, fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                      {cwe.id}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        background: cwe.severity === 'HIGH' ? '#e74c3c' : cwe.severity === 'MEDIUM' ? '#f39c12' : '#27ae60',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {cwe.severity}
                      </span>
                      <span style={{
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {cwe.ddosRelevance}% DDoS
                      </span>
                    </div>
                  </div>

                  <h4 style={{ color: theme.primary, fontSize: '1rem', marginBottom: '12px' }}>
                    {cwe.name}
                  </h4>
                  
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '16px' }}>
                    {cwe.description}
                  </p>

                  {/* Examples */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Common Examples:
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cwe.examples.map((example, idx) => (
                        <span key={idx} style={{
                          background: '#f0f0f0',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mitigations */}
                  <div>
                    <h5 style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '8px' }}>
                      Key Mitigations:
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {cwe.mitigations.map((mitigation, idx) => (
                        <span key={idx} style={{
                          background: '#27ae6020',
                          color: '#27ae60',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {mitigation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CVSS Calculator */}
        {activeFramework === 'cvss' && (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
              <div style={{
                background: frameworksData.cvss.color,
                padding: '16px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={32} color="white" />
              </div>
              <div>
                <h2 style={{ color: theme.primary, fontSize: '2rem', margin: 0 }}>
                  CVSS Calculator & Analysis
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', margin: '8px 0 0' }}>
                  Interactive CVSS scoring for DDoS vulnerability assessment
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* CVSS Input Panel */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
                  CVSS 3.1 Base Metrics
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Attack Vector
                    </label>
                    <select
                      value={cvssCalculator.attackVector}
                      onChange={(e) => setCvssCalculator({...cvssCalculator, attackVector: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${theme.cream}`,
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="NETWORK">Network (N)</option>
                      <option value="ADJACENT">Adjacent Network (A)</option>
                      <option value="LOCAL">Local (L)</option>
                      <option value="PHYSICAL">Physical (P)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Attack Complexity
                    </label>
                    <select
                      value={cvssCalculator.attackComplexity}
                      onChange={(e) => setCvssCalculator({...cvssCalculator, attackComplexity: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${theme.cream}`,
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="LOW">Low (L)</option>
                      <option value="HIGH">High (H)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Availability Impact
                    </label>
                    <select
                      value={cvssCalculator.availabilityImpact}
                      onChange={(e) => setCvssCalculator({...cvssCalculator, availabilityImpact: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${theme.cream}`,
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="HIGH">High (H)</option>
                      <option value="LOW">Low (L)</option>
                      <option value="NONE">None (N)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      User Interaction
                    </label>
                    <select
                      value={cvssCalculator.userInteraction}
                      onChange={(e) => setCvssCalculator({...cvssCalculator, userInteraction: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: `2px solid ${theme.cream}`,
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="NONE">None (N)</option>
                      <option value="REQUIRED">Required (R)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CVSS Results Panel */}
              <div style={{
                background: 'white',
                border: `2px solid ${theme.cream}`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
                  Calculated CVSS Score
                </h3>
                
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '4rem',
                    fontWeight: '700',
                    color: calculateCVSSScore() >= 7 ? '#e74c3c' : 
                           calculateCVSSScore() >= 4 ? '#f39c12' : '#27ae60'
                  }}>
                    {calculateCVSSScore()}
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '8px' }}>
                    Base Score
                  </div>
                  <div style={{
                    background: calculateCVSSScore() >= 7 ? '#e74c3c20' : 
                               calculateCVSSScore() >= 4 ? '#f39c1220' : '#27ae6020',
                    color: calculateCVSSScore() >= 7 ? '#e74c3c' : 
                           calculateCVSSScore() >= 4 ? '#f39c12' : '#27ae60',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    {calculateCVSSScore() >= 9 ? 'CRITICAL' :
                     calculateCVSSScore() >= 7 ? 'HIGH' :
                     calculateCVSSScore() >= 4 ? 'MEDIUM' : 'LOW'}
                  </div>
                </div>

                {/* Vector String */}
                <div style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: theme.primary, marginBottom: '8px', fontSize: '0.9rem' }}>
                    CVSS Vector String:
                  </h4>
                  <code style={{ 
                    fontSize: '0.8rem', 
                    background: 'white', 
                    padding: '8px', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    display: 'block'
                  }}>
                    CVSS:3.1/AV:{cvssCalculator.attackVector.charAt(0)}/AC:{cvssCalculator.attackComplexity.charAt(0)}/
                    PR:{cvssCalculator.privilegesRequired.charAt(0)}/UI:{cvssCalculator.userInteraction.charAt(0)}/
                    S:{cvssCalculator.scope.charAt(0)}/C:{cvssCalculator.confidentialityImpact.charAt(0)}/
                    I:{cvssCalculator.integrityImpact.charAt(0)}/A:{cvssCalculator.availabilityImpact.charAt(0)}
                  </code>
                </div>

                {/* DDoS Context */}
                <div style={{
                  background: `${theme.accent}10`,
                  border: `2px solid ${theme.accent}30`,
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ color: theme.accent, marginBottom: '8px', fontSize: '0.9rem' }}>
                    DDoS Attack Context:
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                    {calculateCVSSScore() >= 7 ? 
                      'High severity - This vulnerability could enable significant DDoS attacks with major service disruption.' :
                      calculateCVSSScore() >= 4 ?
                      'Medium severity - Potential for moderate DDoS impact, requires monitoring and mitigation planning.' :
                      'Lower severity - Limited DDoS potential but should still be addressed as part of comprehensive security.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CPE Products and Other Frameworks would go here */}
        {activeFramework === 'cpe' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              background: frameworksData.cpe.color,
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Cpu size={32} color="white" />
            </div>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '16px' }}>
              Common Platform Enumeration (CPE)
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
              Product vulnerability analysis and network infrastructure categorization
            </p>
            
            <div style={{
              background: `${theme.cream}50`,
              border: `2px dashed ${theme.lightAccent}`,
              borderRadius: '16px',
              padding: '40px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '16px' }}>Coming Soon</h3>
              <p style={{ color: '#666', fontSize: '1rem' }}>
                Advanced CPE analysis including network device categorization, 
                vulnerability mapping, and product-specific DDoS risk assessment.
              </p>
            </div>
          </div>
        )}

        {activeFramework === 'correlation' && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              background: theme.accent,
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Network size={32} color="white" />
            </div>
            <h2 style={{ color: theme.primary, fontSize: '2rem', marginBottom: '16px' }}>
              Cross-Framework Analysis
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
              Advanced correlation analysis across KEV, CWE, CPE, and CVSS frameworks
            </p>
            
            <div style={{
              background: `${theme.cream}50`,
              border: `2px dashed ${theme.lightAccent}`,
              borderRadius: '16px',
              padding: '40px'
            }}>
              <h3 style={{ color: theme.primary, marginBottom: '16px' }}>Advanced Analytics</h3>
              <p style={{ color: '#666', fontSize: '1rem' }}>
                Multi-framework correlation engine with predictive analysis, 
                vulnerability trend mapping, and comprehensive risk scoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// API Service Classes
class BrowserCache {
  constructor() {
    this.prefix = 'ddos_dashboard_';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
  }

  set(key, data, maxAge = this.maxAge) {
    const item = {
      data,
      timestamp: Date.now(),
      maxAge
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  get(key) {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > parsed.maxAge) {
      this.remove(key);
      return null;
    }
    return parsed.data;
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}

class CVEService {
  constructor() {
    this.cache = new BrowserCache();
    this.baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
    this.requestQueue = [];
    this.isProcessing = false;
  }

  async searchCVEs(params = {}) {
    const cacheKey = `cves_${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams({
        resultsPerPage: params.limit || 100,
        startIndex: params.offset || 0,
        ...params
      });

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('CVE API Error:', error);
      return { vulnerabilities: [], totalResults: 0, error: error.message };
    }
  }

  async getCVEById(cveId) {
    const cacheKey = `cve_${cveId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}?cveId=${cveId}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('CVE Fetch Error:', error);
      return { error: error.message };
    }
  }
}

class DDoSCorrelationEngine {
  constructor() {
    this.cveService = new CVEService();
    this.ddosKeywords = [
      'denial of service', 'dos attack', 'ddos', 'amplification',
      'exhaustion', 'flooding', 'resource consumption', 'availability',
      'traffic flood', 'bandwidth', 'overload', 'overwhelm'
    ];
    this.ddosCWEs = [
      'CWE-400', 'CWE-770', 'CWE-834', 'CWE-672', 'CWE-730',
      'CWE-920', 'CWE-404', 'CWE-405', 'CWE-409'
    ];
    this.networkProducts = [
      'router', 'firewall', 'load balancer', 'dns server', 'web server',
      'proxy', 'gateway', 'switch', 'network device'
    ];
  }

  analyzeCVE(cve) {
    const description = cve.cve?.descriptions?.[0]?.value?.toLowerCase() || '';
    const summary = cve.cve?.vulnStatus || '';
    
    let score = 0;
    const indicators = {
      keywords: [],
      cwes: [],
      cvss: null,
      networkBased: false,
      highAvailabilityImpact: false
    };

    // Keyword analysis
    this.ddosKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        score += 10;
        indicators.keywords.push(keyword);
      }
    });

    // CWE analysis
    const weaknesses = cve.cve?.weaknesses || [];
    weaknesses.forEach(weakness => {
      weakness.description?.forEach(desc => {
        if (this.ddosCWEs.includes(desc.value)) {
          score += 15;
          indicators.cwes.push(desc.value);
        }
      });
    });

    // CVSS analysis
    const metrics = cve.cve?.metrics;
    if (metrics) {
      const cvssData = metrics.cvssMetricV31?.[0] || metrics.cvssMetricV30?.[0] || metrics.cvssMetricV2?.[0];
      if (cvssData) {
        indicators.cvss = {
          baseScore: cvssData.cvssData?.baseScore,
          attackVector: cvssData.cvssData?.attackVector,
          availabilityImpact: cvssData.cvssData?.availabilityImpact,
          vectorString: cvssData.cvssData?.vectorString
        };

        if (cvssData.cvssData?.attackVector === 'NETWORK') {
          score += 8;
          indicators.networkBased = true;
        }

        if (cvssData.cvssData?.availabilityImpact === 'HIGH') {
          score += 12;
          indicators.highAvailabilityImpact = true;
        }
      }
    }

    // Product analysis
    const configs = cve.cve?.configurations || [];
    configs.forEach(config => {
      config.nodes?.forEach(node => {
        node.cpeMatch?.forEach(match => {
          const product = match.criteria?.toLowerCase() || '';
          this.networkProducts.forEach(netProduct => {
            if (product.includes(netProduct)) {
              score += 5;
            }
          });
        });
      });
    });

    return {
      isDDoSRelated: score >= 20,
      confidence: Math.min(score / 50 * 100, 100),
      score,
      indicators,
      cve
    };
  }

  async findDDoSCVEs(limit = 100) {
    try {
      // Search for recent CVEs
      const results = await this.cveService.searchCVEs({ 
        limit,
        pubStartDate: '2020-01-01T00:00:00.000',
        pubEndDate: new Date().toISOString().split('T')[0] + 'T23:59:59.999'
      });

      if (results.error) {
        return { error: results.error, ddosCVEs: [] };
      }

      const ddosCVEs = [];
      const allCVEs = results.vulnerabilities || [];

      for (const vuln of allCVEs) {
        const analysis = this.analyzeCVE(vuln);
        if (analysis.isDDoSRelated) {
          ddosCVEs.push(analysis);
        }
      }

      return {
        ddosCVEs: ddosCVEs.sort((a, b) => b.confidence - a.confidence),
        totalAnalyzed: allCVEs.length,
        totalFound: ddosCVEs.length
      };
    } catch (error) {
      console.error('DDoS Correlation Error:', error);
      return { error: error.message, ddosCVEs: [] };
    }
  }
}

// Mock data for demonstration (until APIs are fully integrated)
const generateMockDDoSData = () => {
  const attackTypes = ['Volumetric', 'Protocol', 'Application Layer', 'Amplification', 'Botnet'];
  const industries = ['Finance', 'Gaming', 'E-commerce', 'Government', 'Healthcare', 'Technology'];
  const protocols = ['HTTP/HTTPS', 'DNS', 'NTP', 'SSDP', 'Memcached', 'LDAP'];
  
  const mockCVEs = [];
  for (let i = 0; i < 50; i++) {
    mockCVEs.push({
      id: `CVE-2024-${1000 + i}`,
      confidence: Math.random() * 100,
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      cvssScore: (Math.random() * 4 + 6).toFixed(1),
      publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `DDoS vulnerability enabling ${attackTypes[Math.floor(Math.random() * attackTypes.length)].toLowerCase()} attacks`,
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

// Advanced Analytics Component
const AnalyticsHub = () => {
  const [ddosData, setDdosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    attackType: '',
    industry: '',
    dateRange: '',
    minCVSS: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('confidence');

  const correlationEngine = new DDoSCorrelationEngine();

  useEffect(() => {
    loadDDoSData();
  }, []);

  const loadDDoSData = async () => {
    setLoading(true);
    try {
      // For now, use mock data - will integrate real API calls
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const mockData = generateMockDDoSData();
      setDdosData(mockData);
    } catch (error) {
      console.error('Failed to load DDoS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = ddosData.filter(item => {
    return (
      (!filters.attackType || item.attackType === filters.attackType) &&
      (!filters.industry || item.industry === filters.industry) &&
      (item.cvssScore >= filters.minCVSS) &&
      (!searchTerm || item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }).sort((a, b) => {
    switch(sortBy) {
      case 'confidence': return b.confidence - a.confidence;
      case 'cvss': return b.cvssScore - a.cvssScore;
      case 'date': return new Date(b.publishedDate) - new Date(a.publishedDate);
      default: return 0;
    }
  });

  if (loading) {
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
        <p style={{ color: theme.primary, fontSize: '1.2rem' }}>Analyzing DDoS-CVE Correlations...</p>
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
          DDoS Analytics Hub
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Real-time correlation analysis of CVEs with DDoS attack vectors and comprehensive threat intelligence
        </p>
      </div>

      {/* Controls Bar */}
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
                onFocus={(e) => e.target.style.borderColor = theme.lightAccent}
                onBlur={(e) => e.target.style.borderColor = theme.cream}
              />
            </div>
          </div>

          {/* Attack Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
              Attack Type
            </label>
            <select
              value={filters.attackType}
              onChange={(e) => setFilters({...filters, attackType: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.cream}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Types</option>
              <option value="Volumetric">Volumetric</option>
              <option value="Protocol">Protocol</option>
              <option value="Application Layer">Application Layer</option>
              <option value="Amplification">Amplification</option>
              <option value="Botnet">Botnet</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.primary }}>
              Target Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.cream}`,
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Industries</option>
              <option value="Finance">Finance</option>
              <option value="Gaming">Gaming</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Government">Government</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Technology">Technology</option>
            </select>
          </div>

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

          {/* Refresh Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={loadDDoSData}
              style={{
                background: `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        color: 'white'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>{filteredData.length}</div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>DDoS-Related CVEs</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + parseFloat(item.cvssScore), 0) / filteredData.length).toFixed(1) : '0.0'}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Avg CVSS Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + item.confidence, 0) / filteredData.length) : 0}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Avg Confidence</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: theme.cream }}>
              {new Set(filteredData.map(item => item.attackType)).size}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Attack Types</div>
          </div>
        </div>
      </div>

      {/* CVE Results Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {filteredData.map((item, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: `2px solid ${theme.cream}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,96,0,0.15)';
            e.currentTarget.style.borderColor = theme.lightAccent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = theme.cream;
          }}>
            {/* CVE Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ 
                color: theme.primary, 
                fontSize: '1.3rem',
                fontWeight: '700',
                margin: 0
              }}>
                {item.id}
              </h3>
              <div style={{
                background: item.confidence >= 80 ? '#e74c3c' : item.confidence >= 60 ? '#f39c12' : '#3498db',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {Math.round(item.confidence)}% Confidence
              </div>
            </div>

            {/* CVE Details */}
            <p style={{ 
              color: '#666', 
              fontSize: '0.95rem',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              {item.description}
            </p>

            {/* Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ 
                background: theme.cream, 
                padding: '12px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: theme.primary }}>{item.cvssScore}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>CVSS Score</div>
              </div>
              <div style={{ 
                background: theme.cream, 
                padding: '12px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: theme.primary }}>{item.attackType}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Attack Type</div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{
                background: `${theme.accent}20`,
                color: theme.accent,
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {item.industry}
              </span>
              <span style={{
                background: `${theme.primary}20`,
                color: theme.primary,
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {item.protocol}
              </span>
              <span style={{
                background: `${theme.lightAccent}30`,
                color: theme.dark,
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {item.publishedDate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <AlertTriangle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '8px' }}>No matching CVEs found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};
const mockStats = {
  totalCVEs: 15847,
  ddosRelated: 2341,
  criticalSeverity: 892,
  yearlyIncrease: 23.4,
  topAttackVector: 'Network Amplification',
  avgCVSSScore: 7.2
};

// Navigation Component
const Navigation = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'validation', label: 'Validation Methods', icon: Shield },
    { id: 'frameworks', label: 'Security Frameworks', icon: Database },
    { id: 'interactive', label: 'Attack Simulations', icon: Target },
    { id: 'intelligence', label: 'Threat Intelligence', icon: Eye }
  ];

  return (
    <nav style={{ 
      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.dark} 100%)`,
      padding: '1rem 2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            background: `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color="white" />
          </div>
          <h1 style={{ 
            color: theme.cream, 
            margin: 0, 
            fontSize: '1.8rem',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            DDoS Analytics Hub
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '2px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  background: isActive ? theme.accent : 'transparent',
                  color: isActive ? 'white' : theme.cream,
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  opacity: isActive ? 1 : 0.8
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = `${theme.accent}33`;
                    e.target.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                    e.target.style.opacity = '0.8';
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Statistics Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, trend }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: `2px solid ${theme.cream}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,96,0,0.15)';
    e.currentTarget.style.borderColor = theme.lightAccent;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
    e.currentTarget.style.borderColor = theme.cream;
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})`,
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} color="white" />
      </div>
      <h3 style={{ margin: 0, color: theme.primary, fontSize: '1.1rem', fontWeight: '600' }}>{title}</h3>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '2.2rem', fontWeight: '700', color: theme.primary }}>{value}</span>
      {trend && (
        <span style={{ 
          color: trend > 0 ? '#e74c3c' : '#27ae60', 
          fontSize: '0.9rem', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <TrendingUp size={14} />
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{subtitle}</p>
  </div>
);

// Hero Section Component
const HeroSection = () => (
  <div style={{
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.dark} 50%, ${theme.accent}15 100%)`,
    padding: '80px 2rem',
    color: 'white',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Animated Background Elements */}
    <div style={{
      position: 'absolute',
      top: '20%',
      left: '10%',
      width: '100px',
      height: '100px',
      background: `${theme.accent}20`,
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute',
      top: '60%',
      right: '15%',
      width: '60px',
      height: '60px',
      background: `${theme.lightAccent}30`,
      borderRadius: '50%',
      animation: 'float 4s ease-in-out infinite reverse'
    }} />
    
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <h1 style={{ 
        fontSize: '3.5rem', 
        fontWeight: '800', 
        marginBottom: '24px',
        background: `linear-gradient(45deg, white, ${theme.cream})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: '1.2'
      }}>
        DDoS Attack Intelligence Platform
      </h1>
      <p style={{ 
        fontSize: '1.3rem', 
        marginBottom: '40px', 
        color: theme.cream,
        lineHeight: '1.6',
        fontWeight: '300'
      }}>
        Comprehensive analysis of Distributed Denial of Service attacks through CVE correlation, 
        interactive visualizations, and real-time threat intelligence
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{
          background: `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 25px rgba(255,96,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}>
          <BarChart3 size={20} />
          Explore Analytics
        </button>
        <button style={{
          background: 'transparent',
          color: theme.cream,
          border: `2px solid ${theme.cream}`,
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = theme.cream;
          e.target.style.color = theme.primary;
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.color = theme.cream;
          e.target.style.transform = 'translateY(0)';
        }}>
          <Target size={20} />
          Try Simulations
        </button>
      </div>
    </div>
  </div>
);

// Main Content Component
const MainContent = () => {
  // Mock Statistics for Homepage
  const mockStats = {
    totalCVEs: 15847,
    ddosRelated: 2341,
    criticalSeverity: 892,
    yearlyIncrease: 23.4,
    topAttackVector: 'Network Amplification',
    avgCVSSScore: 7.2
  };

  return (
  <div style={{ padding: '60px 2rem', maxWidth: '1400px', margin: '0 auto' }}>
    {/* Statistics Grid */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '24px',
      marginBottom: '60px' 
    }}>
      <StatCard 
        icon={Database}
        title="Total CVEs Analyzed"
        value={mockStats.totalCVEs.toLocaleString()}
        subtitle="Comprehensive vulnerability database"
      />
      <StatCard 
        icon={AlertTriangle}
        title="DDoS-Related CVEs"
        value={mockStats.ddosRelated.toLocaleString()}
        subtitle="Direct correlation identified"
        trend={mockStats.yearlyIncrease}
      />
      <StatCard 
        icon={Zap}
        title="Critical Severity"
        value={mockStats.criticalSeverity.toLocaleString()}
        subtitle="High-impact vulnerabilities"
      />
      <StatCard 
        icon={Activity}
        title="Average CVSS Score"
        value={mockStats.avgCVSSScore}
        subtitle="Severity assessment metric"
      />
    </div>

    {/* Feature Overview Grid */}
    <div style={{ marginBottom: '60px' }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: theme.primary, 
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '20px'
      }}>
        Platform Capabilities
      </h2>
      <p style={{ 
        textAlign: 'center', 
        color: '#666', 
        fontSize: '1.2rem',
        marginBottom: '50px',
        maxWidth: '600px',
        margin: '0 auto 50px'
      }}>
        Dive deep into DDoS attack patterns, correlations, and defensive strategies through our comprehensive analysis tools
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '30px' 
      }}>
        {[
          {
            icon: BarChart3,
            title: "Multi-Dimensional Analytics",
            description: "Analyze DDoS attacks by corporation, source language, attack vectors, and network protocols with interactive visualizations"
          },
          {
            icon: Shield,
            title: "CVE-DDoS Correlation",
            description: "Automated identification and mapping of vulnerabilities that enable or facilitate DDoS attacks across multiple frameworks"
          },
          {
            icon: Target,
            title: "Interactive Attack Simulations",
            description: "Immersive demonstrations of attack methodologies with network topology visualizations and real-time traffic pattern analysis"
          },
          {
            icon: Network,
            title: "Attack Vector Analysis",
            description: "Deep dive into DDoS surface attacks, protocol-based attacks, and similar attack pattern recognition with clustering analysis"
          },
          {
            icon: Users,
            title: "Actor Intelligence",
            description: "Track attackers and victims with advanced filtering, including botnet analysis and recurring IP pattern detection"
          },
          {
            icon: TrendingUp,
            title: "Trend Analysis",
            description: "Historical progression of DDoS techniques, defensive improvements, and predictive analysis of emerging threats"
          }
        ].map((feature, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: `2px solid ${theme.cream}`,
            transition: 'all 0.4s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(255,96,0,0.12)';
            e.currentTarget.style.borderColor = theme.lightAccent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = theme.cream;
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})`,
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-flex',
              marginBottom: '20px'
            }}>
              <feature.icon size={28} color="white" />
            </div>
            <h3 style={{ 
              color: theme.primary, 
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '16px',
              lineHeight: '1.3'
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              color: '#666', 
              lineHeight: '1.6',
              fontSize: '1rem'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Call to Action */}
    <div style={{
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
      borderRadius: '24px',
      padding: '50px',
      textAlign: 'center',
      color: 'white'
    }}>
      <h2 style={{ 
        fontSize: '2.2rem',
        fontWeight: '700',
        marginBottom: '16px',
        color: theme.cream
      }}>
        Ready to Explore DDoS Intelligence?
      </h2>
      <p style={{ 
        fontSize: '1.1rem',
        marginBottom: '30px',
        color: theme.cream,
        opacity: 0.9
      }}>
        Start analyzing attack patterns, exploring correlations, and understanding the evolving landscape of DDoS threats
      </p>
      <button style={{
        background: `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
        color: 'white',
        border: 'none',
        padding: '18px 40px',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.boxShadow = '0 8px 25px rgba(255,96,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = 'none';
      }}>
        Get Started
      </button>
    </div>
  </div>
);
};

};

// Interactive Attack Simulations Component
const InteractiveSimulations = () => {
  const [activeSimulation, setActiveSimulation] = useState('network-flow');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [attackType, setAttackType] = useState('volumetric');
  const [attackIntensity, setAttackIntensity] = useState(50);

  // Attack Types Configuration
  const attackTypes = {
    volumetric: {
      name: 'Volumetric Attack',
      description: 'Overwhelming target with massive traffic volume',
      color: '#e74c3c',
      methods: ['UDP Flood', 'ICMP Flood', 'HTTP Flood']
    },
    protocol: {
      name: 'Protocol Attack',
      description: 'Exploiting weaknesses in network protocols',
      color: '#9b59b6',
      methods: ['SYN Flood', 'TCP RST Attack', 'SACK Panic']
    },
    application: {
      name: 'Application Layer',
      description: 'Targeting specific application vulnerabilities',
      color: '#f39c12',
      methods: ['HTTP GET/POST', 'Slowloris', 'R.U.D.Y.']
    },
    amplification: {
      name: 'Amplification Attack',
      description: 'Using third-party servers to amplify attack traffic',
      color: '#e67e22',
      methods: ['DNS Amplification', 'NTP Amplification', 'Memcached']
    }
  };

  // Timeline Steps for Level 2
  const timelineSteps = [
    { title: 'Reconnaissance', description: 'Attacker identifies target and vulnerabilities', duration: 2000 },
    { title: 'Botnet Assembly', description: 'Compromised devices are coordinated', duration: 3000 },
    { title: 'Attack Initiation', description: 'Initial traffic flood begins', duration: 2000 },
    { title: 'Traffic Amplification', description: 'Attack volume scales exponentially', duration: 4000 },
    { title: 'Service Degradation', description: 'Target systems become overwhelmed', duration: 3000 },
    { title: 'Defense Activation', description: 'Mitigation strategies deploy', duration: 3000 },
    { title: 'Traffic Filtering', description: 'Malicious traffic gets blocked', duration: 2000 },
    { title: 'Service Recovery', description: 'Normal operations resume', duration: 2000 }
  ];

  // Simple Network Flow Visualization
  const NetworkFlowVisualization = () => {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#f8f9fa',
        borderRadius: '16px',
        margin: '20px'
      }}>
        <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
          Network Flow Visualization - Level 1
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          alignItems: 'center',
          margin: '40px 0'
        }}>
          {/* Attacker Nodes */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: attackTypes[attackType]?.color || '#e74c3c',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isSimulationRunning ? 'pulse 1s infinite' : 'none'
            }}>
              <Users size={32} color="white" />
            </div>
            <h4 style={{ color: attackTypes[attackType]?.color }}>Botnet</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {isSimulationRunning ? 'Sending Attack Traffic' : 'Ready to Attack'}
            </p>
          </div>

          {/* Attack Flow Arrow */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '3rem',
              color: theme.accent,
              animation: isSimulationRunning ? 'pulse 0.5s infinite' : 'none'
            }}>
              →
            </div>
            <p style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600',
              color: theme.primary,
              marginTop: '10px'
            }}>
              {attackTypes[attackType]?.name}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Intensity: {attackIntensity}%
            </p>
          </div>

          {/* Target Server */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: isSimulationRunning ? '#e74c3c' : theme.accent,
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isSimulationRunning ? 'pulse 2s infinite' : 'none',
              filter: isSimulationRunning ? 'drop-shadow(0 0 20px rgba(231,76,60,0.8))' : 'none'
            }}>
              <Database size={32} color="white" />
            </div>
            <h4 style={{ color: isSimulationRunning ? '#e74c3c' : theme.primary }}>
              Target Server
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {isSimulationRunning ? 'Under Attack!' : 'Normal Operation'}
            </p>
          </div>
        </div>

        {/* Attack Statistics */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ color: theme.primary, marginBottom: '15px' }}>
            Live Attack Statistics
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
                {isSimulationRunning ? Math.floor(attackIntensity * 1000) : 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Packets/sec</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
                {isSimulationRunning ? attackIntensity : 0}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Server Load</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
                {isSimulationRunning ? Math.floor(attackIntensity / 10) : 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Bots</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Attack Timeline - Level 2
  const AttackTimeline = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
      if (!isPlaying) return;
      
      const timer = setTimeout(() => {
        if (currentStep < timelineSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsPlaying(false);
          setCurrentStep(0);
        }
      }, timelineSteps[currentStep]?.duration || 2000);

      return () => clearTimeout(timer);
    }, [currentStep, isPlaying]);

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ color: theme.primary, fontSize: '1.5rem', marginBottom: '10px' }}>
            DDoS Attack Timeline Analysis - Level 2
          </h3>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Step-by-step breakdown of {attackTypes[attackType]?.name} progression
          </p>
        </div>

        {/* Timeline Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px', 
          marginBottom: '30px' 
        }}>
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              if (currentStep === timelineSteps.length - 1) setCurrentStep(0);
            }}
            style={{
              background: `linear-gradient(45deg, ${theme.accent}, ${theme.lightAccent})`,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'} Timeline
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            style={{
              background: 'transparent',
              color: theme.primary,
              border: `2px solid ${theme.primary}`,
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Reset
          </button>
        </div>

        {/* Current Step Details */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `2px solid ${theme.cream}`,
          textAlign: 'center'
        }}>
          <h4 style={{ 
            color: theme.primary, 
            fontSize: '1.4rem', 
            marginBottom: '12px',
            fontWeight: '700'
          }}>
            Step {currentStep + 1}: {timelineSteps[currentStep]?.title}
          </h4>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {timelineSteps[currentStep]?.description}
          </p>
          
          <div style={{
            background: theme.cream,
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0'
          }}>
            {currentStep < 2 && (
              <div style={{ color: theme.primary, fontWeight: '600' }}>
                🔍 Preparation Phase - Gathering intelligence and resources
              </div>
            )}
            {currentStep >= 2 && currentStep < 5 && (
              <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                ⚡ Active Attack Phase - {attackTypes[attackType]?.name} in progress
              </div>
            )}
            {currentStep >= 5 && (
              <div style={{ color: '#27ae60', fontWeight: '600' }}>
                🛡️ Defense & Recovery Phase - Mitigation strategies active
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Interactive Controls - Level 3
  const InteractiveControls = () => {
    const [defenseEnabled, setDefenseEnabled] = useState(false);
    const [firewallLevel, setFirewallLevel] = useState(1);
    const [loadBalancer, setLoadBalancer] = useState(false);
    const [rateLimiting, setRateLimiting] = useState(false);

    const effectivenessScore = () => {
      let score = 0;
      if (defenseEnabled) score += 30;
      score += firewallLevel * 15;
      if (loadBalancer) score += 25;
      if (rateLimiting) score += 20;
      return Math.min(score, 100);
    };

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Attack Configuration */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: `2px solid ${theme.cream}`
          }}>
            <h3 style={{ color: theme.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={24} />
              Attack Configuration
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Attack Type
              </label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${theme.cream}`,
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                {Object.entries(attackTypes).map(([key, type]) => (
                  <option key={key} value={key}>{type.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Attack Intensity: {attackIntensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={attackIntensity}
                onChange={(e) => setAttackIntensity(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, ${theme.lightAccent}, ${theme.accent})`,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              background: attackTypes[attackType]?.color + '20',
              padding: '16px',
              borderRadius: '8px',
              border: `2px solid ${attackTypes[attackType]?.color}40`
            }}>
              <h4 style={{ color: attackTypes[attackType]?.color, marginBottom: '8px' }}>
                {attackTypes[attackType]?.name}
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                {attackTypes[attackType]?.description}
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                Methods: {attackTypes[attackType]?.methods.join(', ')}
              </div>
            </div>
          </div>

          {/* Defense Configuration */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: `2px solid ${theme.cream}`
          }}>
            <h3 style={{ color: theme.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={24} />
              Defense Configuration
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: '12px',
                padding: '12px',
                border: `2px solid ${defenseEnabled ? theme.accent : theme.cream}`,
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="checkbox"
                  checked={defenseEnabled}
                  onChange={(e) => setDefenseEnabled(e.target.checked)}
                  style={{ transform: 'scale(1.5)' }}
                />
                <span style={{ fontWeight: '600' }}>Enable DDoS Protection</span>
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Firewall Level: {firewallLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={firewallLevel}
                onChange={(e) => setFirewallLevel(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, #3498db, #e74c3c)`,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={loadBalancer}
                  onChange={(e) => setLoadBalancer(e.target.checked)}
                />
                <span>Load Balancer</span>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={rateLimiting}
                  onChange={(e) => setRateLimiting(e.target.checked)}
                />
                <span>Rate Limiting</span>
              </label>
            </div>

            {/* Defense Effectiveness */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
              borderRadius: '8px',
              color: 'white',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px', color: theme.cream }}>Defense Effectiveness</h4>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {effectivenessScore()}%
              </div>
            </div>
          </div>
        </div>

        {/* Battle Result */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `2px solid ${theme.cream}`,
          textAlign: 'center'
        }}>
          <h3 style={{ color: theme.primary, marginBottom: '20px' }}>
            Battle Simulation Result
          </h3>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            margin: '30px 0'
          }}>
            {/* Attack Side */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: attackTypes[attackType]?.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Zap size={32} color="white" />
              </div>
              <h4 style={{ color: attackTypes[attackType]?.color }}>
                Attack Force
              </h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {attackIntensity}%
              </div>
            </div>

            {/* VS */}
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: theme.primary
            }}>
              VS
            </div>

            {/* Defense Side */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: defenseEnabled ? '#27ae60' : '#95a5a6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Shield size={32} color="white" />
              </div>
              <h4 style={{ color: defenseEnabled ? '#27ae60' : '#95a5a6' }}>
                Defense Force
              </h4>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {effectivenessScore()}%
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: attackIntensity > effectivenessScore() ? 
              '#e74c3c20' : '#27ae6020',
            border: `2px solid ${attackIntensity > effectivenessScore() ? 
              '#e74c3c' : '#27ae60'}40`,
            marginBottom: '20px'
          }}>
            <h4 style={{ 
              color: attackIntensity > effectivenessScore() ? '#e74c3c' : '#27ae60',
              marginBottom: '8px'
            }}>
              {attackIntensity > effectivenessScore() ? 
                '🚨 Attack Successful - Service Compromised' : 
                '🛡️ Defense Successful - Service Protected'
              }
            </h4>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              {attackIntensity > effectivenessScore() ? 
                'The attack overwhelmed the defenses. Consider strengthening security measures.' :
                'Defense systems successfully mitigated the attack. Service remains operational.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Simulation Type Selector
  const simulationTypes = [
    { 
      id: 'network-flow', 
      name: 'Network Flow Visualization', 
      icon: Network,
      description: 'Level 1: Watch attack traffic flow in real-time'
    },
    { 
      id: 'timeline', 
      name: 'Attack Timeline', 
      icon: Calendar,
      description: 'Level 2: Step-by-step attack progression analysis'
    },
    { 
      id: 'interactive', 
      name: 'Interactive Simulation', 
      icon: Target,
      description: 'Level 3: Full attack vs defense simulation'
    }
  ];

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
          Interactive Attack Simulations
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Experience DDoS attacks through immersive visualizations, timeline analysis, and interactive battle simulations
        </p>
      </div>

      {/* Simulation Type Selector */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {simulationTypes.map(type => {
          const Icon = type.icon;
          const isActive = activeSimulation === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setActiveSimulation(type.id)}
              style={{
                background: isActive ? `linear-gradient(135deg, ${theme.accent}, ${theme.lightAccent})` : 'white',
                color: isActive ? 'white' : theme.primary,
                border: isActive ? 'none' : `2px solid ${theme.cream}`,
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 12px 40px rgba(255,96,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Icon size={24} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>
                  {type.name}
                </h3>
              </div>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Area */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        overflow: 'hidden'
      }}>
        {/* Simulation Controls */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 8px', color: theme.cream }}>
                {simulationTypes.find(t => t.id === activeSimulation)?.name}
              </h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Current Attack: {attackTypes[attackType]?.name}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                style={{
                  background: isSimulationRunning ? '#e74c3c' : theme.accent,
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSimulationRunning ? 'Stop' : 'Start'} Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Content */}
        <div>
          {activeSimulation === 'network-flow' && <NetworkFlowVisualization />}
          {activeSimulation === 'timeline' && <AttackTimeline />}
          {activeSimulation === 'interactive' && <InteractiveControls />}
        </div>
      </div>
    </div>
  );
};

// Placeholder Components for Other Sections
const PlaceholderSection = ({ title, description, features }) => (
  <div style={{ padding: '60px 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
    <h1 style={{ 
      color: theme.primary, 
      fontSize: '2.8rem',
      fontWeight: '700',
      marginBottom: '20px'
    }}>
      {title}
    </h1>
    <p style={{ 
      color: '#666', 
      fontSize: '1.2rem',
      marginBottom: '40px',
      maxWidth: '600px',
      margin: '0 auto 40px'
    }}>
      {description}
    </p>
    <div style={{
      background: `linear-gradient(135deg, ${theme.cream}, #f8f8f8)`,
      borderRadius: '20px',
      padding: '40px',
      border: `2px dashed ${theme.lightAccent}`
    }}>
      <h3 style={{ color: theme.primary, marginBottom: '20px' }}>Coming Soon</h3>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        color: '#666'
      }}>
        {features.map((feature, index) => (
          <li key={index} style={{ 
            padding: '8px 0',
            fontSize: '1rem'
          }}>
            ✓ {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Main App Component
const DDoSAnalyticsDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');

  // Add floating animation keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const renderSection = () => {
    switch(activeSection) {
      case 'home':
        return (
          <>
            <HeroSection />
            <MainContent />
          </>
        );
      case 'analytics':
        return <AnalyticsHub />;
      case 'validation':
        return <AttackValidationMethods />;
      case 'frameworks':
        return <SecurityFrameworks />;
      case 'interactive':
        return <InteractiveSimulations />;
      case 'intelligence':
        return <ThreatIntelligencePlatform />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      background: theme.light
    }}>
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderSection()}
    </div>
  );
};

export default DDoSAnalyticsDashboard;