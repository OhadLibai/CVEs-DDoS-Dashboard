import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVisualizationCleanup } from './memory-management';

// WebGL Network Visualization Component
const WebGLNetworkVisualization = ({ 
  networkData, 
  attackData, 
  isSimulationRunning = false,
  viewMode = '2d', // '2d' or '3d'
  theme,
  width = 800,
  height = 600
}) => {
  const canvasRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const { webgl, canvas, datasets } = useVisualizationCleanup(canvasRef);

  // Initialize WebGL context and shaders
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const gl = webgl.createContext({ 
        antialias: true, 
        alpha: true,
        premultipliedAlpha: false 
      });
      
      if (!gl) {
        setError('WebGL not supported');
        return;
      }

      // Initialize shaders
      const shaderProgram = initializeShaders(gl, webgl);
      if (!shaderProgram) {
        setError('Failed to initialize shaders');
        return;
      }

      // Initialize network visualization
      const networkViz = new NetworkVisualization(gl, shaderProgram, webgl);
      networkViz.initialize(width, height, viewMode);

      // Store in datasets for cleanup
      datasets.addDataset('webgl_context', { gl, networkViz, shaderProgram }, {
        priority: 'high',
        maxAge: 3600000, // 1 hour
        onEvict: (data) => {
          console.log('Cleaning up WebGL network visualization');
        }
      });

      setIsInitialized(true);

      // Start render loop
      const renderLoop = (timestamp) => {
        if (!isInitialized) return;
        
        try {
          networkViz.update(timestamp, networkData, attackData, isSimulationRunning);
          networkViz.render();
          
          if (isSimulationRunning) {
            requestAnimationFrame(renderLoop);
          }
        } catch (renderError) {
          console.error('Render loop error:', renderError);
          setError('Rendering failed');
        }
      };

      if (isSimulationRunning) {
        requestAnimationFrame(renderLoop);
      }

    } catch (initError) {
      console.error('WebGL initialization failed:', initError);
      setError('Initialization failed');
    }
  }, [width, height, viewMode, webgl, datasets]);

  // Update visualization when data changes
  useEffect(() => {
    if (!isInitialized) return;

    const storedData = datasets.getDataset('webgl_context');
    if (storedData?.networkViz) {
      storedData.networkViz.updateData(networkData, attackData);
    }
  }, [networkData, attackData, isInitialized, datasets]);

  // Handle simulation state changes
  useEffect(() => {
    if (!isInitialized) return;

    const storedData = datasets.getDataset('webgl_context');
    if (storedData?.networkViz) {
      if (isSimulationRunning) {
        storedData.networkViz.startSimulation();
      } else {
        storedData.networkViz.stopSimulation();
      }
    }
  }, [isSimulationRunning, isInitialized, datasets]);

  if (error) {
    return (
      <div style={{
        width,
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
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⚠️ WebGL Error</div>
          <div>{error}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Falling back to 2D visualization
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: `2px solid ${theme?.cream || '#f0f0f0'}`,
          borderRadius: '8px',
          background: '#000'
        }}
      />
      
      {!isInitialized && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '8px'
        }}>
          Initializing WebGL...
        </div>
      )}
    </div>
  );
};

// Initialize WebGL shaders
function initializeShaders(gl, webglHelper) {
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    attribute float a_size;
    
    uniform vec2 u_resolution;
    uniform mat3 u_transform;
    uniform float u_time;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      vec3 transformed = u_transform * vec3(a_position, 1.0);
      
      // Convert from pixels to clip space
      vec2 clipSpace = ((transformed.xy / u_resolution) * 2.0) - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      
      // Animate alpha based on time for pulsing effect
      v_alpha = 0.8 + 0.2 * sin(u_time * 0.005 + length(a_position) * 0.01);
      v_color = a_color;
      gl_PointSize = a_size;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      // Create circular points
      vec2 coord = gl_PointCoord - vec2(0.5);
      float distance = length(coord);
      
      if (distance > 0.5) {
        discard;
      }
      
      // Soft edges
      float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
      gl_FragColor = vec4(v_color, alpha * v_alpha);
    }
  `;

  const vertexShader = webglHelper.createShaderProgram(vertexShaderSource, fragmentShaderSource);
  return vertexShader;
}

// Network Visualization Class
class NetworkVisualization {
  constructor(gl, shaderProgram, webglHelper) {
    this.gl = gl;
    this.program = shaderProgram;
    this.webglHelper = webglHelper;
    
    this.nodes = [];
    this.connections = [];
    this.packets = [];
    this.animationTime = 0;
    
    this.uniforms = {};
    this.attributes = {};
    this.buffers = {};
    
    this.isSimulating = false;
    this.lastUpdateTime = 0;
  }

  initialize(width, height, viewMode) {
    const gl = this.gl;
    
    // Set viewport
    gl.viewport(0, 0, width, height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Get uniform and attribute locations
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      transform: gl.getUniformLocation(this.program, 'u_transform'),
      time: gl.getUniformLocation(this.program, 'u_time')
    };
    
    this.attributes = {
      position: gl.getAttribLocation(this.program, 'a_position'),
      color: gl.getAttribLocation(this.program, 'a_color'),
      size: gl.getAttribLocation(this.program, 'a_size')
    };
    
    // Create buffers
    this.buffers.position = this.webglHelper.createBuffer(new Float32Array(0));
    this.buffers.color = this.webglHelper.createBuffer(new Float32Array(0));
    this.buffers.size = this.webglHelper.createBuffer(new Float32Array(0));
    
    // Set initial uniforms
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.resolution, width, height);
    
    // Identity transform matrix
    const transform = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
    gl.uniformMatrix3fv(this.uniforms.transform, false, transform);
    
    this.initializeNetworkLayout(width, height, viewMode);
  }

  initializeNetworkLayout(width, height, viewMode) {
    this.nodes = [];
    this.connections = [];
    
    if (viewMode === '3d') {
      this.create3DNetworkLayout(width, height);
    } else {
      this.create2DNetworkLayout(width, height);
    }
  }

  create2DNetworkLayout(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create network nodes
    this.nodes = [
      // Attacker nodes (left side)
      { id: 'bot1', x: 100, y: 150, type: 'bot', color: [1.0, 0.2, 0.2], size: 8 },
      { id: 'bot2', x: 80, y: 250, type: 'bot', color: [1.0, 0.2, 0.2], size: 8 },
      { id: 'bot3', x: 120, y: 350, type: 'bot', color: [1.0, 0.2, 0.2], size: 8 },
      { id: 'bot4', x: 90, y: 450, type: 'bot', color: [1.0, 0.2, 0.2], size: 8 },
      
      // Network infrastructure (middle)
      { id: 'router1', x: 300, y: 200, type: 'router', color: [0.2, 0.8, 1.0], size: 12 },
      { id: 'router2', x: 300, y: 400, type: 'router', color: [0.2, 0.8, 1.0], size: 12 },
      { id: 'firewall', x: 500, y: 300, type: 'firewall', color: [1.0, 0.6, 0.0], size: 15 },
      
      // Target server (right side)
      { id: 'target', x: 700, y: 300, type: 'server', color: [0.2, 1.0, 0.2], size: 20 }
    ];
    
    // Create connections
    this.connections = [
      { from: 'bot1', to: 'router1' },
      { from: 'bot2', to: 'router1' },
      { from: 'bot3', to: 'router2' },
      { from: 'bot4', to: 'router2' },
      { from: 'router1', to: 'firewall' },
      { from: 'router2', to: 'firewall' },
      { from: 'firewall', to: 'target' }
    ];
  }

  create3DNetworkLayout(width, height) {
    // For 3D layout, we'll use perspective projection
    // This is a simplified 3D projection onto 2D canvas
    const centerX = width / 2;
    const centerY = height / 2;
    const depth = 200;
    
    this.nodes = [
      // Front layer - attackers
      { id: 'bot1', x: 100, y: 150, z: -depth, type: 'bot', color: [1.0, 0.2, 0.2], size: 6 },
      { id: 'bot2', x: 80, y: 350, z: -depth, type: 'bot', color: [1.0, 0.2, 0.2], size: 6 },
      { id: 'bot3', x: 120, y: 450, z: -depth, type: 'bot', color: [1.0, 0.2, 0.2], size: 6 },
      
      // Middle layer - network infrastructure
      { id: 'router1', x: centerX - 100, y: centerY - 50, z: 0, type: 'router', color: [0.2, 0.8, 1.0], size: 10 },
      { id: 'router2', x: centerX + 100, y: centerY + 50, z: 0, type: 'router', color: [0.2, 0.8, 1.0], size: 10 },
      { id: 'firewall', x: centerX, y: centerY, z: 50, type: 'firewall', color: [1.0, 0.6, 0.0], size: 12 },
      
      // Back layer - target
      { id: 'target', x: centerX, y: centerY, z: depth, type: 'server', color: [0.2, 1.0, 0.2], size: 16 }
    ];
    
    // Apply 3D to 2D projection
    this.nodes.forEach(node => {
      const projected = this.project3DTo2D(node.x, node.y, node.z, width, height);
      node.x = projected.x;
      node.y = projected.y;
      node.size *= projected.scale;
    });
  }

  project3DTo2D(x, y, z, width, height) {
    const fov = 60; // Field of view in degrees
    const distance = 500; // Camera distance
    
    const scale = distance / (distance + z);
    return {
      x: (x - width/2) * scale + width/2,
      y: (y - height/2) * scale + height/2,
      scale: scale
    };
  }

  updateData(networkData, attackData) {
    if (attackData && this.isSimulating) {
      this.generatePackets(attackData);
    }
    
    // Update node colors based on attack state
    this.nodes.forEach(node => {
      if (node.type === 'server' && this.isSimulating) {
        // Make target server pulse red during attack
        const pulse = 0.5 + 0.5 * Math.sin(this.animationTime * 0.01);
        node.color = [1.0, pulse * 0.2, pulse * 0.2];
      } else if (node.type === 'bot' && this.isSimulating) {
        // Make bots pulse during attack
        const pulse = 0.8 + 0.2 * Math.sin(this.animationTime * 0.008 + node.x * 0.01);
        node.color = [1.0, pulse * 0.2, pulse * 0.2];
      }
    });
  }

  generatePackets(attackData) {
    // Generate new packets from bots to target
    if (Math.random() < 0.3) { // 30% chance per frame
      const botNodes = this.nodes.filter(n => n.type === 'bot');
      const targetNode = this.nodes.find(n => n.type === 'server');
      
      if (botNodes.length > 0 && targetNode) {
        const bot = botNodes[Math.floor(Math.random() * botNodes.length)];
        
        this.packets.push({
          id: Date.now() + Math.random(),
          startX: bot.x,
          startY: bot.y,
          endX: targetNode.x,
          endY: targetNode.y,
          currentX: bot.x,
          currentY: bot.y,
          progress: 0,
          speed: 0.02 + Math.random() * 0.03,
          color: [1.0, 0.4, 0.0],
          size: 3 + Math.random() * 2,
          lifetime: 0
        });
      }
    }
    
    // Update existing packets
    this.packets = this.packets.filter(packet => {
      packet.progress += packet.speed;
      packet.lifetime++;
      
      if (packet.progress >= 1.0) {
        // Packet reached target - create explosion effect
        this.createExplosionEffect(packet.endX, packet.endY);
        return false;
      }
      
      // Update position
      packet.currentX = packet.startX + (packet.endX - packet.startX) * packet.progress;
      packet.currentY = packet.startY + (packet.endY - packet.startY) * packet.progress;
      
      return packet.lifetime < 1000; // Remove old packets
    });
  }

  createExplosionEffect(x, y) {
    // Create small explosion particles
    for (let i = 0; i < 5; i++) {
      this.packets.push({
        id: Date.now() + Math.random(),
        startX: x,
        startY: y,
        endX: x + (Math.random() - 0.5) * 50,
        endY: y + (Math.random() - 0.5) * 50,
        currentX: x,
        currentY: y,
        progress: 0,
        speed: 0.05,
        color: [1.0, 1.0, 0.0],
        size: 2,
        lifetime: 0
      });
    }
  }

  update(timestamp, networkData, attackData, isSimulating) {
    this.animationTime = timestamp;
    this.isSimulating = isSimulating;
    
    if (timestamp - this.lastUpdateTime > 16) { // ~60 FPS
      this.updateData(networkData, attackData);
      this.lastUpdateTime = timestamp;
    }
  }

  render() {
    const gl = this.gl;
    
    // Clear the canvas
    gl.clearColor(0.02, 0.02, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.time, this.animationTime);
    
    // Render connections first (as lines)
    this.renderConnections();
    
    // Render nodes
    this.renderNodes();
    
    // Render packets
    this.renderPackets();
  }

  renderConnections() {
    const gl = this.gl;
    
    // For simplicity, we'll render connections as thin lines between nodes
    // In a more advanced implementation, we could use line shaders
    this.connections.forEach(conn => {
      const fromNode = this.nodes.find(n => n.id === conn.from);
      const toNode = this.nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        // Draw a simple line by rendering small dots between points
        const steps = 20;
        const positions = [];
        const colors = [];
        const sizes = [];
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = fromNode.x + (toNode.x - fromNode.x) * t;
          const y = fromNode.y + (toNode.y - fromNode.y) * t;
          
          positions.push(x, y);
          colors.push(0.3, 0.3, 0.6);
          sizes.push(1.5);
        }
        
        this.renderPoints(positions, colors, sizes);
      }
    });
  }

  renderNodes() {
    const positions = [];
    const colors = [];
    const sizes = [];
    
    this.nodes.forEach(node => {
      positions.push(node.x, node.y);
      colors.push(...node.color);
      sizes.push(node.size);
    });
    
    this.renderPoints(positions, colors, sizes);
  }

  renderPackets() {
    if (this.packets.length === 0) return;
    
    const positions = [];
    const colors = [];
    const sizes = [];
    
    this.packets.forEach(packet => {
      positions.push(packet.currentX, packet.currentY);
      colors.push(...packet.color);
      sizes.push(packet.size);
    });
    
    this.renderPoints(positions, colors, sizes);
  }

  renderPoints(positions, colors, sizes) {
    const gl = this.gl;
    
    if (positions.length === 0) return;
    
    // Update buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.position);
    gl.vertexAttribPointer(this.attributes.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.color);
    gl.vertexAttribPointer(this.attributes.color, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.attributes.size);
    gl.vertexAttribPointer(this.attributes.size, 1, gl.FLOAT, false, 0, 0);
    
    // Draw points
    gl.drawArrays(gl.POINTS, 0, positions.length / 2);
  }

  startSimulation() {
    this.isSimulating = true;
    this.packets = []; // Clear existing packets
  }

  stopSimulation() {
    this.isSimulating = false;
    this.packets = []; // Clear packets when stopping
    
    // Reset node colors
    this.nodes.forEach(node => {
      if (node.type === 'server') {
        node.color = [0.2, 1.0, 0.2];
      } else if (node.type === 'bot') {
        node.color = [1.0, 0.2, 0.2];
      }
    });
  }
}

// Enhanced Interactive Simulations with WebGL
const EnhancedInteractiveSimulations = ({ theme }) => {
  const [activeSimulation, setActiveSimulation] = useState('webgl-network');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [attackType, setAttackType] = useState('volumetric');
  const [attackIntensity, setAttackIntensity] = useState(50);
  const [viewMode, setViewMode] = useState('2d');

  const networkData = {
    nodes: ['bot1', 'bot2', 'bot3', 'router1', 'firewall', 'target'],
    connections: [
      { from: 'bot1', to: 'router1' },
      { from: 'bot2', to: 'router1' },
      { from: 'router1', to: 'firewall' },
      { from: 'firewall', to: 'target' }
    ]
  };

  const attackData = {
    type: attackType,
    intensity: attackIntensity,
    active: isSimulationRunning
  };

  return (
    <div style={{ padding: '40px 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          color: theme.primary, 
          fontSize: '2.8rem',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          Enhanced Interactive Attack Simulations
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          WebGL-powered network visualizations with real-time packet flow animations
        </p>
      </div>

      {/* Controls */}
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
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Visualization Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.cream}`,
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="2d">2D Network</option>
              <option value="3d">3D Network</option>
            </select>
          </div>

          <div>
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
              <option value="volumetric">Volumetric Attack</option>
              <option value="protocol">Protocol Attack</option>
              <option value="application">Application Layer</option>
            </select>
          </div>

          <div>
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
                background: `linear-gradient(to right, ${theme.lightAccent}, ${theme.accent})`
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
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
                fontWeight: '600'
              }}
            >
              {isSimulationRunning ? 'Stop Attack' : 'Start Attack'}
            </button>
          </div>
        </div>
      </div>

      {/* WebGL Visualization */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
        border: `2px solid ${theme.cream}`,
        padding: '24px'
      }}>
        <h3 style={{ color: theme.primary, marginBottom: '20px', textAlign: 'center' }}>
          WebGL Network Visualization - {viewMode.toUpperCase()} Mode
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WebGLNetworkVisualization
            networkData={networkData}
            attackData={attackData}
            isSimulationRunning={isSimulationRunning}
            viewMode={viewMode}
            theme={theme}
            width={800}
            height={600}
          />
        </div>

        {/* Simulation Stats */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
              {isSimulationRunning ? Math.floor(attackIntensity * 100) : 0}
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
              {viewMode.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>View Mode</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accent }}>
              {attackType}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Attack Type</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { 
  WebGLNetworkVisualization, 
  EnhancedInteractiveSimulations 
};