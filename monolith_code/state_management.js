// Enhanced State Management with Zustand Integration
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

// Main Application Store
const useAppStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Application State
        app: {
          currentSection: 'home',
          theme: 'default',
          initialized: false,
          lastActivity: Date.now()
        },

        // API Configuration State
        api: {
          orchestrator: null,
          services: {
            nvd: { enabled: true, healthy: true, requests: 0 },
            ipinfo: { enabled: true, healthy: true, requests: 0 },
            opencve: { enabled: false, healthy: false, requests: 0 },
            cve: { enabled: true, healthy: true, requests: 0 }
          },
          rateLimits: {},
          lastHealthCheck: null
        },

        // Data State
        data: {
          cves: [],
          threatIntelligence: [],
          geoData: new Map(),
          correlations: [],
          loading: false,
          error: null,
          lastUpdate: null,
          totalCount: 0,
          filters: {
            attackType: '',
            industry: '',
            minCVSS: 0,
            dateRange: '',
            protocol: ''
          },
          sortBy: 'confidence',
          searchTerm: ''
        },

        // UI State
        ui: {
          sidebarOpen: true,
          modals: {
            cveDetails: { open: false, data: null },
            settings: { open: false },
            export: { open: false }
          },
          notifications: [],
          virtualization: {
            enabled: true,
            itemHeight: 120,
            overscan: 5
          }
        },

        // Simulation State
        simulation: {
          active: false,
          type: 'network-flow',
          attackType: 'volumetric',
          intensity: 50,
          viewMode: '2d',
          statistics: {
            packetsGenerated: 0,
            attacksSimulated: 0,
            uptime: 0
          }
        },

        // Performance State
        performance: {
          metrics: {
            apiResponseTimes: [],
            renderTimes: [],
            memoryUsage: [],
            errorRates: []
          },
          benchmarks: {
            lastRun: null,
            results: null
          }
        },

        // Actions
        actions: {
          // App Actions
          setCurrentSection: (section) => 
            set((state) => ({ 
              app: { ...state.app, currentSection: section, lastActivity: Date.now() }
            })),

          initializeApp: (config) =>
            set((state) => ({
              app: { ...state.app, initialized: true },
              api: { ...state.api, orchestrator: config.orchestrator }
            })),

          // API Actions
          updateAPIHealth: (serviceName, health) =>
            set((state) => ({
              api: {
                ...state.api,
                services: {
                  ...state.api.services,
                  [serviceName]: { ...state.api.services[serviceName], ...health }
                },
                lastHealthCheck: Date.now()
              }
            })),

          updateRateLimits: (limits) =>
            set((state) => ({
              api: { ...state.api, rateLimits: limits }
            })),

          // Data Actions
          setCVEData: (cves, totalCount = null) =>
            set((state) => ({
              data: {
                ...state.data,
                cves,
                totalCount: totalCount || cves.length,
                lastUpdate: Date.now(),
                loading: false,
                error: null
              }
            })),

          appendCVEData: (newCVEs) =>
            set((state) => ({
              data: {
                ...state.data,
                cves: [...state.data.cves, ...newCVEs],
                lastUpdate: Date.now()
              }
            })),

          setLoading: (loading, error = null) =>
            set((state) => ({
              data: { ...state.data, loading, error }
            })),

          updateFilters: (filters) =>
            set((state) => ({
              data: {
                ...state.data,
                filters: { ...state.data.filters, ...filters }
              }
            })),

          setSearchTerm: (searchTerm) =>
            set((state) => ({
              data: { ...state.data, searchTerm }
            })),

          setSortBy: (sortBy) =>
            set((state) => ({
              data: { ...state.data, sortBy }
            })),

          addThreatIntelligence: (threat) =>
            set((state) => ({
              data: {
                ...state.data,
                threatIntelligence: [...state.data.threatIntelligence, threat]
              }
            })),

          updateGeoData: (ip, geoInfo) =>
            set((state) => {
              const newGeoData = new Map(state.data.geoData);
              newGeoData.set(ip, geoInfo);
              return {
                data: { ...state.data, geoData: newGeoData }
              };
            }),

          // UI Actions
          toggleSidebar: () =>
            set((state) => ({
              ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
            })),

          openModal: (modalName, data = null) =>
            set((state) => ({
              ui: {
                ...state.ui,
                modals: {
                  ...state.ui.modals,
                  [modalName]: { open: true, data }
                }
              }
            })),

          closeModal: (modalName) =>
            set((state) => ({
              ui: {
                ...state.ui,
                modals: {
                  ...state.ui.modals,
                  [modalName]: { open: false, data: null }
                }
              }
            })),

          addNotification: (notification) =>
            set((state) => ({
              ui: {
                ...state.ui,
                notifications: [
                  ...state.ui.notifications,
                  { ...notification, id: Date.now(), timestamp: Date.now() }
                ]
              }
            })),

          removeNotification: (id) =>
            set((state) => ({
              ui: {
                ...state.ui,
                notifications: state.ui.notifications.filter(n => n.id !== id)
              }
            })),

          updateVirtualization: (settings) =>
            set((state) => ({
              ui: {
                ...state.ui,
                virtualization: { ...state.ui.virtualization, ...settings }
              }
            })),

          // Simulation Actions
          startSimulation: (type, config = {}) =>
            set((state) => ({
              simulation: {
                ...state.simulation,
                active: true,
                type,
                ...config,
                statistics: {
                  ...state.simulation.statistics,
                  attacksSimulated: state.simulation.statistics.attacksSimulated + 1
                }
              }
            })),

          stopSimulation: () =>
            set((state) => ({
              simulation: { ...state.simulation, active: false }
            })),

          updateSimulationStats: (stats) =>
            set((state) => ({
              simulation: {
                ...state.simulation,
                statistics: { ...state.simulation.statistics, ...stats }
              }
            })),

          setSimulationConfig: (config) =>
            set((state) => ({
              simulation: { ...state.simulation, ...config }
            })),

          // Performance Actions
          addPerformanceMetric: (type, value) =>
            set((state) => {
              const metrics = [...state.performance.metrics[type], value];
              // Keep only last 100 metrics
              if (metrics.length > 100) {
                metrics.shift();
              }
              return {
                performance: {
                  ...state.performance,
                  metrics: {
                    ...state.performance.metrics,
                    [type]: metrics
                  }
                }
              };
            }),

          setBenchmarkResults: (results) =>
            set((state) => ({
              performance: {
                ...state.performance,
                benchmarks: {
                  lastRun: Date.now(),
                  results
                }
              }
            })),

          // Utility Actions
          clearAllData: () =>
            set((state) => ({
              data: {
                ...state.data,
                cves: [],
                threatIntelligence: [],
                geoData: new Map(),
                correlations: [],
                totalCount: 0,
                lastUpdate: null
              }
            })),

          resetFilters: () =>
            set((state) => ({
              data: {
                ...state.data,
                filters: {
                  attackType: '',
                  industry: '',
                  minCVSS: 0,
                  dateRange: '',
                  protocol: ''
                },
                searchTerm: '',
                sortBy: 'confidence'
              }
            })),

          exportState: () => {
            const state = get();
            return {
              exported: Date.now(),
              app: state.app,
              data: {
                ...state.data,
                geoData: Array.from(state.data.geoData.entries()) // Convert Map to array for serialization
              },
              ui: state.ui,
              simulation: state.simulation
            };
          },

          importState: (importedState) => {
            set((state) => ({
              ...state,
              ...importedState,
              data: {
                ...importedState.data,
                geoData: new Map(importedState.data.geoData) // Convert back to Map
              }
            }));
          }
        }
      }),
      {
        name: 'ddos-analytics-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          app: {
            theme: state.app.theme,
            currentSection: state.app.currentSection
          },
          data: {
            filters: state.data.filters,
            sortBy: state.data.sortBy
          },
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            virtualization: state.ui.virtualization
          }
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // Handle migration between versions
          if (version < 1) {
            // Migration logic for version updates
            return {
              ...persistedState,
              // Add new fields or transform old ones
            };
          }
          return persistedState;
        }
      }
    )
  )
);

// Store Selectors (for optimized re-renders)
export const useCurrentSection = () => useAppStore((state) => state.app.currentSection);
export const useCVEData = () => useAppStore((state) => state.data.cves);
export const useFilters = () => useAppStore((state) => state.data.filters);
export const useSimulation = () => useAppStore((state) => state.simulation);
export const useAPIHealth = () => useAppStore((state) => state.api.services);
export const useNotifications = () => useAppStore((state) => state.ui.notifications);

// Custom Hooks for Complex State Operations
export const useFilteredCVEs = () => {
  return useAppStore((state) => {
    const { cves, filters, searchTerm, sortBy } = state.data;
    
    let filtered = cves.filter(cve => {
      return (
        (!filters.attackType || cve.attackType === filters.attackType) &&
        (!filters.industry || cve.industry === filters.industry) &&
        (!filters.protocol || cve.protocol === filters.protocol) &&
        (cve.cvssScore === 'N/A' || parseFloat(cve.cvssScore) >= filters.minCVSS) &&
        (!searchTerm || 
         cve.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         cve.description?.toLowerCase().includes(searchTerm.toLowerCase()))
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
  });
};

export const useDataStats = () => {
  return useAppStore((state) => {
    const { cves, threatIntelligence, totalCount } = state.data;
    
    return {
      totalCVEs: cves.length,
      totalThreats: threatIntelligence.length,
      totalFromAPI: totalCount,
      avgCVSSScore: cves.length > 0 ? 
        (cves.reduce((sum, cve) => sum + (parseFloat(cve.cvssScore) || 0), 0) / cves.length).toFixed(1) : 
        '0.0',
      avgConfidence: cves.length > 0 ? 
        Math.round(cves.reduce((sum, cve) => sum + (cve.confidence || 0), 0) / cves.length) : 
        0,
      attackTypes: [...new Set(cves.map(cve => cve.attackType).filter(Boolean))].length
    };
  });
};

// Store Actions Hook
export const useStoreActions = () => useAppStore((state) => state.actions);

// Store Subscriptions for Side Effects
export const subscribeToAPIHealth = (callback) => {
  return useAppStore.subscribe(
    (state) => state.api.services,
    (services, previousServices) => {
      // Check for health changes
      Object.keys(services).forEach(serviceName => {
        const current = services[serviceName];
        const previous = previousServices?.[serviceName];
        
        if (previous && current.healthy !== previous.healthy) {
          callback(serviceName, current.healthy, current);
        }
      });
    }
  );
};

export const subscribeToDataChanges = (callback) => {
  return useAppStore.subscribe(
    (state) => ({ 
      cveCount: state.data.cves.length, 
      lastUpdate: state.data.lastUpdate 
    }),
    (current, previous) => {
      if (current.cveCount !== previous?.cveCount || 
          current.lastUpdate !== previous?.lastUpdate) {
        callback(current);
      }
    }
  );
};

export const subscribeToSimulation = (callback) => {
  return useAppStore.subscribe(
    (state) => state.simulation,
    (simulation, previousSimulation) => {
      if (simulation.active !== previousSimulation?.active) {
        callback(simulation.active, simulation);
      }
    }
  );
};

// Store Middleware for Development
export const useStoreDevTools = () => {
  const store = useAppStore;
  
  return {
    getState: () => store.getState(),
    setState: (newState) => store.setState(newState),
    subscribe: store.subscribe,
    
    // Debug utilities
    logState: () => console.log('Current State:', store.getState()),
    logAPIHealth: () => console.log('API Health:', store.getState().api.services),
    logDataStats: () => console.log('Data Stats:', {
      cveCount: store.getState().data.cves.length,
      threatCount: store.getState().data.threatIntelligence.length,
      filters: store.getState().data.filters
    }),
    
    // Performance monitoring
    measureRender: (componentName, renderFn) => {
      const start = performance.now();
      const result = renderFn();
      const end = performance.now();
      
      store.getState().actions.addPerformanceMetric('renderTimes', {
        component: componentName,
        duration: end - start,
        timestamp: Date.now()
      });
      
      return result;
    }
  };
};

// Store Reset and Cleanup
export const resetStore = () => {
  useAppStore.setState({
    app: {
      currentSection: 'home',
      theme: 'default',
      initialized: false,
      lastActivity: Date.now()
    },
    data: {
      cves: [],
      threatIntelligence: [],
      geoData: new Map(),
      correlations: [],
      loading: false,
      error: null,
      lastUpdate: null,
      totalCount: 0,
      filters: {
        attackType: '',
        industry: '',
        minCVSS: 0,
        dateRange: '',
        protocol: ''
      },
      sortBy: 'confidence',
      searchTerm: ''
    },
    simulation: {
      active: false,
      type: 'network-flow',
      attackType: 'volumetric',
      intensity: 50,
      viewMode: '2d',
      statistics: {
        packetsGenerated: 0,
        attacksSimulated: 0,
        uptime: 0
      }
    }
  });
};

// Store Persistence Utilities
export const clearStoredState = () => {
  localStorage.removeItem('ddos-analytics-store');
  resetStore();
};

export const exportStoreState = () => {
  const state = useAppStore.getState();
  return state.actions.exportState();
};

export const importStoreState = (stateData) => {
  const actions = useAppStore.getState().actions;
  actions.importState(stateData);
};

export default useAppStore;