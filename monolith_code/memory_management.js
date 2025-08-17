import { useEffect, useRef, useCallback, useState } from 'react';

// Core cleanup management hook
export const useCleanupManager = () => {
  const cleanupFunctions = useRef([]);
  const isUnmounted = useRef(false);

  const addCleanup = useCallback((cleanupFunction, description = 'Unknown cleanup') => {
    if (typeof cleanupFunction !== 'function') {
      console.warn('Cleanup function must be a function');
      return;
    }

    const cleanup = {
      fn: cleanupFunction,
      description,
      timestamp: Date.now()
    };

    cleanupFunctions.current.push(cleanup);

    // Return a function to remove this cleanup
    return () => {
      const index = cleanupFunctions.current.indexOf(cleanup);
      if (index > -1) {
        cleanupFunctions.current.splice(index, 1);
      }
    };
  }, []);

  const runCleanup = useCallback(() => {
    if (isUnmounted.current) return;

    console.log(`Running ${cleanupFunctions.current.length} cleanup functions`);
    
    cleanupFunctions.current.forEach((cleanup, index) => {
      try {
        cleanup.fn();
      } catch (error) {
        console.warn(`Cleanup function ${index} (${cleanup.description}) failed:`, error);
      }
    });

    cleanupFunctions.current = [];
  }, []);

  const getCleanupStats = useCallback(() => {
    return {
      count: cleanupFunctions.current.length,
      descriptions: cleanupFunctions.current.map(c => c.description),
      oldestTimestamp: Math.min(...cleanupFunctions.current.map(c => c.timestamp))
    };
  }, []);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      runCleanup();
    };
  }, [runCleanup]);

  return { addCleanup, runCleanup, getCleanupStats };
};

// WebGL context management hook
export const useWebGLCleanup = (canvasRef) => {
  const { addCleanup } = useCleanupManager();
  const glContextRef = useRef(null);
  const programsRef = useRef([]);
  const buffersRef = useRef([]);
  const texturesRef = useRef([]);

  const createContext = useCallback((contextAttributes = {}) => {
    if (!canvasRef.current) {
      console.warn('Canvas ref not available');
      return null;
    }

    const gl = canvasRef.current.getContext('webgl', {
      antialias: true,
      alpha: true,
      ...contextAttributes
    });

    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    glContextRef.current = gl;

    // Add context cleanup
    addCleanup(() => {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }, 'WebGL context cleanup');

    return gl;
  }, [canvasRef, addCleanup]);

  const createShaderProgram = useCallback((vertexShaderSource, fragmentShaderSource) => {
    const gl = glContextRef.current;
    if (!gl) return null;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    programsRef.current.push(program);

    // Add program cleanup
    addCleanup(() => {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    }, `Shader program cleanup`);

    return program;
  }, [addCleanup]);

  const createBuffer = useCallback((data, usage = WebGLRenderingContext.STATIC_DRAW) => {
    const gl = glContextRef.current;
    if (!gl) return null;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);

    buffersRef.current.push(buffer);

    // Add buffer cleanup
    addCleanup(() => {
      gl.deleteBuffer(buffer);
    }, 'Buffer cleanup');

    return buffer;
  }, [addCleanup]);

  const createTexture = useCallback((image) => {
    const gl = glContextRef.current;
    if (!gl) return null;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    texturesRef.current.push(texture);

    // Add texture cleanup
    addCleanup(() => {
      gl.deleteTexture(texture);
    }, 'Texture cleanup');

    return texture;
  }, [addCleanup]);

  return {
    createContext,
    createShaderProgram,
    createBuffer,
    createTexture,
    getContext: () => glContextRef.current
  };
};

// Canvas 2D animation management hook
export const useCanvasAnimation = (canvasRef) => {
  const { addCleanup } = useCleanupManager();
  const animationFrameRef = useRef(null);
  const contextRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const getContext = useCallback(() => {
    if (!canvasRef.current) return null;
    
    if (!contextRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }
    
    return contextRef.current;
  }, [canvasRef]);

  const startAnimation = useCallback((animationFunction) => {
    if (isAnimatingRef.current) {
      console.warn('Animation already running');
      return;
    }

    isAnimatingRef.current = true;
    const ctx = getContext();
    if (!ctx) return;

    const animate = (timestamp) => {
      if (!isAnimatingRef.current) return;

      try {
        animationFunction(ctx, timestamp);
      } catch (error) {
        console.error('Animation function error:', error);
        isAnimatingRef.current = false;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Add animation cleanup
    addCleanup(() => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }, 'Canvas animation cleanup');
  }, [getContext, addCleanup]);

  const stopAnimation = useCallback(() => {
    isAnimatingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [getContext, canvasRef]);

  return {
    getContext,
    startAnimation,
    stopAnimation,
    clearCanvas,
    isAnimating: () => isAnimatingRef.current
  };
};

// Large dataset memory management hook
export const useLargeDatasetManager = (initialCapacity = 10000) => {
  const { addCleanup } = useCleanupManager();
  const [datasets, setDatasets] = useState(new Map());
  const capacityRef = useRef(initialCapacity);
  const memoryUsageRef = useRef(0);

  const estimateObjectSize = useCallback((obj) => {
    // Rough estimation of object size in bytes
    return JSON.stringify(obj).length * 2; // UTF-16 encoding approximation
  }, []);

  const addDataset = useCallback((key, data, options = {}) => {
    const { 
      maxAge = 3600000, // 1 hour default
      priority = 'normal',
      onEvict = null
    } = options;

    const size = estimateObjectSize(data);
    const dataset = {
      data,
      size,
      timestamp: Date.now(),
      maxAge,
      priority,
      accessCount: 0,
      lastAccessed: Date.now(),
      onEvict
    };

    setDatasets(prev => {
      const updated = new Map(prev);
      
      // Remove old entry if exists
      if (updated.has(key)) {
        const old = updated.get(key);
        memoryUsageRef.current -= old.size;
      }

      updated.set(key, dataset);
      memoryUsageRef.current += size;

      // Check if we need to evict data
      if (updated.size > capacityRef.current || memoryUsageRef.current > 100 * 1024 * 1024) { // 100MB limit
        evictOldData(updated);
      }

      return updated;
    });

    // Add cleanup for this dataset
    addCleanup(() => {
      setDatasets(prev => {
        const updated = new Map(prev);
        if (updated.has(key)) {
          const dataset = updated.get(key);
          memoryUsageRef.current -= dataset.size;
          if (dataset.onEvict) {
            try {
              dataset.onEvict(dataset.data);
            } catch (error) {
              console.warn('Dataset eviction callback failed:', error);
            }
          }
          updated.delete(key);
        }
        return updated;
      });
    }, `Dataset cleanup: ${key}`);
  }, [addCleanup, estimateObjectSize]);

  const getDataset = useCallback((key) => {
    const dataset = datasets.get(key);
    if (!dataset) return null;

    // Check if expired
    if (Date.now() - dataset.timestamp > dataset.maxAge) {
      removeDataset(key);
      return null;
    }

    // Update access statistics
    dataset.accessCount++;
    dataset.lastAccessed = Date.now();

    return dataset.data;
  }, [datasets]);

  const removeDataset = useCallback((key) => {
    setDatasets(prev => {
      const updated = new Map(prev);
      if (updated.has(key)) {
        const dataset = updated.get(key);
        memoryUsageRef.current -= dataset.size;
        if (dataset.onEvict) {
          try {
            dataset.onEvict(dataset.data);
          } catch (error) {
            console.warn('Dataset eviction callback failed:', error);
          }
        }
        updated.delete(key);
      }
      return updated;
    });
  }, []);

  const evictOldData = useCallback((datasetMap) => {
    const now = Date.now();
    const entries = Array.from(datasetMap.entries());

    // Sort by priority and age (lower priority and older first)
    entries.sort((a, b) => {
      const [, datasetA] = a;
      const [, datasetB] = b;

      // Priority order: low < normal < high
      const priorityOrder = { low: 1, normal: 2, high: 3 };
      const priorityDiff = priorityOrder[datasetA.priority] - priorityOrder[datasetB.priority];
      
      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, evict least recently accessed
      return datasetA.lastAccessed - datasetB.lastAccessed;
    });

    // Remove entries until we're under limits
    let evicted = 0;
    for (const [key, dataset] of entries) {
      if (datasetMap.size <= capacityRef.current * 0.8 && 
          memoryUsageRef.current <= 80 * 1024 * 1024) { // Stop at 80% capacity
        break;
      }

      datasetMap.delete(key);
      memoryUsageRef.current -= dataset.size;
      evicted++;

      if (dataset.onEvict) {
        try {
          dataset.onEvict(dataset.data);
        } catch (error) {
          console.warn('Dataset eviction callback failed:', error);
        }
      }
    }

    if (evicted > 0) {
      console.log(`Evicted ${evicted} datasets to free memory`);
    }
  }, []);

  const getMemoryStats = useCallback(() => {
    const now = Date.now();
    const stats = {
      totalDatasets: datasets.size,
      memoryUsage: memoryUsageRef.current,
      memoryUsageMB: (memoryUsageRef.current / 1024 / 1024).toFixed(2),
      capacity: capacityRef.current,
      expired: 0,
      byPriority: { low: 0, normal: 0, high: 0 }
    };

    datasets.forEach(dataset => {
      if (now - dataset.timestamp > dataset.maxAge) {
        stats.expired++;
      }
      stats.byPriority[dataset.priority]++;
    });

    return stats;
  }, [datasets]);

  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const expiredKeys = [];

    datasets.forEach((dataset, key) => {
      if (now - dataset.timestamp > dataset.maxAge) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => removeDataset(key));
    
    return expiredKeys.length;
  }, [datasets, removeDataset]);

  const setCapacity = useCallback((newCapacity) => {
    capacityRef.current = newCapacity;
    
    // Trigger eviction if over new capacity
    if (datasets.size > newCapacity) {
      setDatasets(prev => {
        const updated = new Map(prev);
        evictOldData(updated);
        return updated;
      });
    }
  }, [datasets.size, evictOldData]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const cleaned = cleanupExpired();
      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} expired datasets`);
      }
    }, 300000); // Clean every 5 minutes

    addCleanup(() => clearInterval(interval), 'Periodic dataset cleanup');

    return () => clearInterval(interval);
  }, [cleanupExpired, addCleanup]);

  return {
    addDataset,
    getDataset,
    removeDataset,
    getMemoryStats,
    cleanupExpired,
    setCapacity,
    clearAll: () => setDatasets(new Map())
  };
};

// Event listener cleanup hook
export const useEventListenerCleanup = () => {
  const { addCleanup } = useCleanupManager();
  const listenersRef = useRef([]);

  const addEventListener = useCallback((element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    
    const listener = { element, event, handler, options };
    listenersRef.current.push(listener);

    addCleanup(() => {
      element.removeEventListener(event, handler, options);
    }, `Event listener cleanup: ${event}`);

    return () => {
      const index = listenersRef.current.indexOf(listener);
      if (index > -1) {
        element.removeEventListener(event, handler, options);
        listenersRef.current.splice(index, 1);
      }
    };
  }, [addCleanup]);

  const removeAllListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    listenersRef.current = [];
  }, []);

  return { addEventListener, removeAllListeners };
};

// Timer management hook
export const useTimerCleanup = () => {
  const { addCleanup } = useCleanupManager();
  const timersRef = useRef([]);

  const setTimeout = useCallback((callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timersRef.current.push({ type: 'timeout', id });

    addCleanup(() => {
      window.clearTimeout(id);
    }, 'Timeout cleanup');

    return id;
  }, [addCleanup]);

  const setInterval = useCallback((callback, delay) => {
    const id = window.setInterval(callback, delay);
    timersRef.current.push({ type: 'interval', id });

    addCleanup(() => {
      window.clearInterval(id);
    }, 'Interval cleanup');

    return id;
  }, [addCleanup]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(({ type, id }) => {
      if (type === 'timeout') {
        window.clearTimeout(id);
      } else if (type === 'interval') {
        window.clearInterval(id);
      }
    });
    timersRef.current = [];
  }, []);

  return { setTimeout, setInterval, clearAllTimers };
};

// Combined visualization cleanup hook
export const useVisualizationCleanup = (canvasRef) => {
  const webgl = useWebGLCleanup(canvasRef);
  const canvas = useCanvasAnimation(canvasRef);
  const events = useEventListenerCleanup();
  const timers = useTimerCleanup();
  const datasets = useLargeDatasetManager();
  const { getCleanupStats } = useCleanupManager();

  return {
    webgl,
    canvas,
    events,
    timers,
    datasets,
    getCleanupStats
  };
};