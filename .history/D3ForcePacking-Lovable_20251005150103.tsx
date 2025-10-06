import React, { useEffect, useRef } from 'react';

interface D3ForcePackingProps {
  className?: string;
}

const D3ForcePacking: React.FC<D3ForcePackingProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get the container dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Create the working HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Circle Packing Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { 
      font-family: sans-serif; 
      text-align: center; 
      margin: 0; 
      padding: 1rem;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #viz { 
      border: 1px solid #ccc; 
      width: 100%;
      height: 100%;
    }
    button { 
      margin-top: 1rem; 
      padding: 0.5rem 1rem; 
      font-size: 1rem; 
    }
  </style>
</head>
<body>
  <svg id="viz"></svg>
  <br>
  <button id="downloadBtn">Download SVG</button>

  <script>
    // === Animation Configuration ===
    const CONFIG = {
      // === LEFT SIDE (MAIN ANIMATION) BALL SETTINGS ===
      BALL_COUNT: 60, // Number of balls in main animation
      BALL_SIZE_MULTIPLIER: 1, // Multiplier for ball sizes (1.0 = original)
      
      // Animation timing
      BALL_APPEAR_DELAY: 10, // ms between ball appearances
      FINAL_SETTLEMENT_TIME:6000, // ms for final settlement phase
      
      // Force simulation parameters (Mike Bostock balanced approach)
      CHARGE_STRENGTH: -80, // Moderate repulsion between balls
      PACK_FORCE_STRENGTH: 0.1, // Very weak pack force (reduced to prevent center crashing)
      COLLISION_PADDING: 4, // Strong collision padding for separation
      ALPHA_DECAY: 0.05, // Very slow decay for gentle settling
      
      // Visual settings
      STROKE_WIDTH: 2,
      LINE_WIDTH: 0.5,
      LINE_OPACITY: 0.3,
      STROKE_COLOR: "#0A61B5",
      LINE_COLOR: "#0A61B5",
      
      // Canvas settings (will be overridden by responsive system)
      CANVAS_SIZE: 1400, // Reference size for scaling calculations
      CENTER_X: 350, // Reference left side center (will be replaced by responsive)
      CENTER_Y: 320, // Reference center Y (will be replaced by responsive)
      
      // === RIGHT SIDE (SIX CLUSTERS) SETTINGS ===
      NUM_CLUSTERS: 6, // Number of clusters
      BALLS_PER_CLUSTER: 8, // Balls per cluster
      RIGHT_CLUSTER_BALL_SIZE: 12, // Size of balls in right clusters
      CLUSTER_RADIUS: 200, // Distance from center to cluster centers
      CLUSTER_PACK_SIZE: 120, // Size of each cluster packing area
      
      // Settlement control
      SETTLEMENT_SPEED: 1, // Multiplier for settlement speed (1 = normal)
      
      // Ball sizing
      USE_ABSOLUTE_SIZING: false, // If true, uses MIN/MAX_RADIUS instead of packing
      MIN_RADIUS: 8,
      MAX_RADIUS: 25,
      MIN_LARGE_RADIUS: 20,
      MAX_LARGE_RADIUS: 35,
      
      // UI toggle
      SHOW_LINES: true, // Toggle for showing connecting lines
      
      // Center force settings
      WEAK_CENTER_FORCE_STRENGTH: 0.001, // Very weak center force to prevent dead zone
      
      // DAG settings
      DAG: {
        OUT_DEGREE: 2,
        CURVE: 0.25,
        ARROW_SIZE: 6,
        EDGE_COLOR: "#0A61B5",
        EDGE_WIDTH: 1.5,
        EDGE_OPACITY: 0.7,
        HIGHLIGHT_COLOR: "#1a8cff",
        HIGHLIGHT_WIDTH: 3,
        TOKEN_RADIUS: 4,
        STEP_MS: 4000,
        TEXT_DISPLAY_DURATION: 5000
      }
    };

    // === RESPONSIVE BREAKPOINTS ===
    const BREAKPOINTS = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };
    
    // Container max-width constraints
    const CONTAINER_MAX_WIDTH = 1600; // Increased to allow 2xl breakpoint (1536px) to trigger
    
    // Current responsive state
    let currentBreakpoint = 'xl'; // Default to desktop
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let containerWidth = Math.min(viewportWidth, CONTAINER_MAX_WIDTH);
    
    // Responsive detection functions
    function getCurrentBreakpoint(width) {
      if (width < BREAKPOINTS.sm) return 'xs';
      if (width < BREAKPOINTS.md) return 'sm';
      if (width < BREAKPOINTS.lg) return 'md';
      if (width < BREAKPOINTS.xl) return 'lg';
      if (width < BREAKPOINTS['2xl']) return 'xl';
      return '2xl';
    }
    
    function updateResponsiveState() {
      const newViewportWidth = window.innerWidth;
      const newViewportHeight = window.innerHeight;
      const newContainerWidth = Math.min(newViewportWidth, CONTAINER_MAX_WIDTH);
      const newBreakpoint = getCurrentBreakpoint(newContainerWidth);
      
      const breakpointChanged = newBreakpoint !== currentBreakpoint;
      const sizeChanged = newViewportWidth !== viewportWidth || newViewportHeight !== viewportHeight;
      
      viewportWidth = newViewportWidth;
      viewportHeight = newViewportHeight;
      containerWidth = newContainerWidth;
      currentBreakpoint = newBreakpoint;
      
      if (breakpointChanged || sizeChanged) {
        handleResponsiveChange(breakpointChanged, sizeChanged);
      }
    }
    
    function handleResponsiveChange(breakpointChanged, sizeChanged) {
      console.log('🔄 Handling responsive change:', { breakpointChanged, sizeChanged });
      
      if (breakpointChanged) {
        console.log('📊 Breakpoint changed to:', currentBreakpoint);
        updateCanvasDimensions();
        updateResponsiveLayout();
        
        // Update cluster positions if they exist
        if (typeof updateClusterPositions === 'function' && typeof sixClusters !== 'undefined' && sixClusters && sixClusters.length > 0) {
          try {
            updateClusterPositions();
            updateClusterGroups();
          } catch (error) {
            console.warn('Failed to update cluster positions:', error);
          }
        }
      }
      
      if (sizeChanged) {
        updateCanvasDimensions();
        updateResponsiveLayout();
      }
    }
    
    // === RESPONSIVE CONFIGURATION ===
    const RESPONSIVE_CONFIG = {
      aspectRatio: 2, // width/height ratio
      breakpoints: {
        xs: { maxWidth: 400, maxHeight: 600, padding: 20, layout: 'stacked', textOffset: 1.8, clusterBallSize: 8, clusterRadius: 80, clusterPackSize: 50, leftBallSizeMultiplier: 0.6, leftLargeBallMultiplier: 1.2, centerYOffset: 0, leftAnimationYOffset: -50, rightAnimationYOffset: 50, leftTitleYOffset: 0, rightTitleYOffset: 0 },
        sm: { maxWidth: 640, maxHeight: 700, padding: 30, layout: 'stacked', textOffset: 1.6, clusterBallSize: 10, clusterRadius: 120, clusterPackSize: 70, leftBallSizeMultiplier: 0.8, leftLargeBallMultiplier: 1.4, centerYOffset: 0, leftAnimationYOffset: -30, rightAnimationYOffset: 30, leftTitleYOffset: 0, rightTitleYOffset: 0 },
        md: { maxWidth: 768, maxHeight: 500, padding: 40, layout: 'hybrid', textOffset: 0.8, clusterBallSize: 12, clusterRadius: 150, clusterPackSize: 90, leftBallSizeMultiplier: 1.0, leftLargeBallMultiplier: 1.6, centerYOffset: 0 },
        lg: { maxWidth: 1024, maxHeight: 550, padding: 50, layout: 'dual', textOffset: 0.7, clusterBallSize: 14, clusterRadius: 180, clusterPackSize: 110, leftBallSizeMultiplier: 1.2, leftLargeBallMultiplier: 1.8, centerYOffset: 0 },
        xl: { maxWidth: 1280, maxHeight: 600, padding: 60, layout: 'dual', textOffset: 0.6, clusterBallSize: 16, clusterRadius: 200, clusterPackSize: 130, leftBallSizeMultiplier: 1.4, leftLargeBallMultiplier: 2.0, centerYOffset: 0 },
        '2xl': { maxWidth: 1600, maxHeight: 700, padding: 80, layout: 'dual', textOffset: 0.5, clusterBallSize: 18, clusterRadius: 220, clusterPackSize: 150, leftBallSizeMultiplier: 1.6, leftLargeBallMultiplier: 2.2, centerYOffset: 0 }
      }
    };
    
    let currentCanvasDimensions = null;
    let currentLayoutParams = null;
    
    function calculateCanvasDimensions() {
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      const availableWidth = Math.min(viewportWidth, CONTAINER_MAX_WIDTH) - (config.padding * 2);
      const availableHeight = viewportHeight - (config.padding * 2);
      
      let canvasWidth, canvasHeight, layout, padding;
      
      if (config.layout === 'stacked') {
        // Stacked: full width, height based on aspect ratio
        canvasWidth = availableWidth;
        canvasHeight = Math.min(availableHeight, canvasWidth / RESPONSIVE_CONFIG.aspectRatio);
        layout = 'stacked';
        padding = config.padding;
      } else if (config.layout === 'hybrid') {
        // Hybrid: use available space efficiently
        canvasWidth = availableWidth;
        canvasHeight = Math.min(availableHeight, canvasWidth / RESPONSIVE_CONFIG.aspectRatio);
        layout = 'hybrid';
        padding = config.padding;
      } else {
        // Dual: standard dual layout
        canvasWidth = availableWidth;
        canvasHeight = Math.min(availableHeight, canvasWidth / RESPONSIVE_CONFIG.aspectRatio);
        layout = 'dual';
        padding = config.padding;
      }
      
      return { canvasWidth, canvasHeight, layout, padding };
    }
    
    function updateCanvasDimensions() {
      const dimensions = calculateCanvasDimensions();
      currentCanvasDimensions = dimensions;
      
      console.log('📐 Canvas dimensions updated:', dimensions);
      
      const svg = d3.select("#viz");
      svg
        .attr("width", dimensions.canvasWidth)
        .attr("height", dimensions.canvasHeight);
      
      console.log('🎯 Canvas updated for ' + currentBreakpoint + ':', dimensions.canvasWidth + 'x' + dimensions.canvasHeight + ' (' + dimensions.layout + ')');
    }
    
    function calculateResponsiveLayout() {
      if (!currentCanvasDimensions) return null;
      
      const canvas = currentCanvasDimensions;
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      
      let leftCenter, rightCenter, scaleFactor, spacing, padding;
      
      if (canvas.layout === 'stacked') {
        // Stacked layout: animations stacked vertically
        const centerY = canvas.canvasHeight / 2;
        leftCenter = { x: canvas.canvasWidth / 2, y: centerY / 2 };
        rightCenter = { x: canvas.canvasWidth / 2, y: centerY + (centerY / 2) };
        scaleFactor = 0.8;
        spacing = 0;
        padding = config.padding;
      } else if (canvas.layout === 'hybrid') {
        // Hybrid layout: 50/50 split for better centering
        const leftWidth = canvas.canvasWidth * 0.5;
        const rightWidth = canvas.canvasWidth * 0.5;
        const centerY = canvas.canvasHeight / 2;
        
        leftCenter = { x: leftWidth / 2, y: centerY };
        rightCenter = { x: leftWidth + (rightWidth / 2), y: centerY };
        scaleFactor = 0.7;
        spacing = canvas.canvasWidth * 0.5;
        padding = config.padding;
      } else {
        // Dual layout: standard side-by-side
        const leftWidth = canvas.canvasWidth * 0.5;
        const rightWidth = canvas.canvasWidth * 0.5;
        const centerY = canvas.canvasHeight / 2;
        
        leftCenter = { x: leftWidth / 2, y: centerY };
        rightCenter = { x: leftWidth + (rightWidth / 2), y: centerY };
        scaleFactor = 0.8;
        spacing = canvas.canvasWidth * 0.5;
        padding = config.padding;
      }
      
      return { leftCenter, rightCenter, scaleFactor, spacing, padding };
    }
    
    function updateResponsiveLayout() {
      currentLayoutParams = calculateResponsiveLayout();
      console.log('🎯 Layout updated for ' + currentBreakpoint + ' breakpoint');
    }
    
    // Helper functions for responsive positioning
    function getResponsiveCenterX(side) {
      if (!currentLayoutParams) return 0;
      return side === 'left' ? currentLayoutParams.leftCenter.x : currentLayoutParams.rightCenter.x;
    }

    function getResponsiveCenterY(side) {
      if (!currentLayoutParams) return 0;
      return side === 'left' ? currentLayoutParams.leftCenter.y : currentLayoutParams.rightCenter.y;
    }

    function getResponsiveScaleFactor() {
      if (!currentLayoutParams) return 1;
      return currentLayoutParams.scaleFactor;
    }

    function isStackedLayout() {
      return currentCanvasDimensions?.layout === 'stacked';
    }

    function isDualLayout() {
      return currentCanvasDimensions?.layout === 'dual';
    }

    function isHybridLayout() {
      return currentCanvasDimensions?.layout === 'hybrid';
    }

    // Responsive helper functions for breakpoint-specific values
    function getResponsiveLeftBallSizeMultiplier() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].leftBallSizeMultiplier || 1;
    }

    function getResponsiveLeftLargeBallMultiplier() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].leftLargeBallMultiplier || 1;
    }

    function getResponsiveCenterYOffset() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].centerYOffset || 0;
    }

    function getResponsiveLeftAnimationYOffset() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].leftAnimationYOffset || 0;
    }

    function getResponsiveRightAnimationYOffset() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].rightAnimationYOffset || 0;
    }

    function getResponsiveLeftTitleYOffset() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].leftTitleYOffset || 0;
    }

    function getResponsiveRightTitleYOffset() {
      return RESPONSIVE_CONFIG.breakpoints[currentBreakpoint].rightTitleYOffset || 0;
    }

    function setupResponsiveMonitoring() {
      // Initial state setup
      updateResponsiveState();
      
      // Set up ResizeObserver for efficient monitoring
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width !== viewportWidth || height !== viewportHeight) {
            updateResponsiveState();
          }
        }
      });
      
      // Start observing the body element
      resizeObserver.observe(document.body);
      
      // Fallback for older browsers
      window.addEventListener('resize', updateResponsiveState);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateResponsiveState);
      };
    }

    // === UI TOGGLE CONFIGURATION ===
    const UI_CONFIG = {
      SHOW_UI_ELEMENTS: false, // Hide UI elements for clean presentation
    };

    function applyUIToggle() {
      const downloadBtn = document.getElementById('downloadBtn');
      const viz = document.getElementById('viz');
      
      if (downloadBtn) {
        downloadBtn.style.display = UI_CONFIG.SHOW_UI_ELEMENTS ? 'block' : 'none';
      }
      
      if (viz) {
        viz.style.border = UI_CONFIG.SHOW_UI_ELEMENTS ? '1px solid #ccc' : 'none';
      }
    }

    // === MAIN VARIABLES ===
    let svg, nodes, currentNodes, simulation, sixClusters;
    let leftAnimationComplete = false;
    let rightAnimationComplete = false;

    // === NODE GENERATION ===
    function generateNodes() {
      const shuffledIndices = d3.shuffle(d3.range(CONFIG.BALL_COUNT));
      const largeBallCount = Math.floor(CONFIG.BALL_COUNT * 0.2); // 20% large balls
      
      return shuffledIndices.map((shuffledIndex, i) => {
        const isLarge = shuffledIndices.indexOf(i) < largeBallCount;
        
        let radius;
        if (CONFIG.USE_ABSOLUTE_SIZING) {
          if (isLarge) {
            radius = CONFIG.MIN_LARGE_RADIUS + Math.random() * (CONFIG.MAX_LARGE_RADIUS - CONFIG.MIN_LARGE_RADIUS);
          } else {
            radius = CONFIG.MIN_RADIUS + Math.random() * (CONFIG.MAX_RADIUS - CONFIG.MIN_RADIUS);
          }
        } else {
          // Use packing-based sizing with responsive multipliers
          const baseRadius = 8 + Math.random() * 12;
          const multiplier = isLarge ? 
            getResponsiveLeftLargeBallMultiplier() : 
            getResponsiveLeftBallSizeMultiplier();
          radius = baseRadius * multiplier;
        }
        
        return {
          id: i,
          x: getResponsiveCenterX('left'),
          y: getResponsiveCenterY('left'),
          vx: 0,
          vy: 0,
          r: radius,
          isLarge: isLarge,
          targetX: null,
          targetY: null,
          targetR: radius
        };
      });
    }

    // === SIX CLUSTER CREATION ===
    function createSixClusters() {
      const clusters = [];
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      const scaleFactor = getResponsiveScaleFactor();
      
      for (let i = 0; i < CONFIG.NUM_CLUSTERS; i++) {
        const angle = (i * 2 * Math.PI) / CONFIG.NUM_CLUSTERS;
        const centerX = getResponsiveCenterX('right') + Math.cos(angle) * CONFIG.CLUSTER_RADIUS * scaleFactor;
        const centerY = getResponsiveCenterY('right') + Math.sin(angle) * CONFIG.CLUSTER_RADIUS * scaleFactor;
        
        const clusterBalls = d3.range(CONFIG.BALLS_PER_CLUSTER).map(j => {
          const ball = {
            id: \`cluster-\${i}-\${j}\`,
            x: centerX,
            y: centerY,
            r: config.clusterBallSize,
            clusterId: i,
            isFirstInCluster: j === 0
          };
          return ball;
        });
        
        const pack = d3.pack()
          .size([CONFIG.CLUSTER_PACK_SIZE * scaleFactor, CONFIG.CLUSTER_PACK_SIZE * scaleFactor])
          .padding(2);
        
        const packData = d3.hierarchy({children: clusterBalls})
          .sum(d => d.r * d.r);
        
        const packResult = pack(packData);
        
        packResult.children.forEach((node, j) => {
          clusterBalls[j].x = node.x + centerX - (CONFIG.CLUSTER_PACK_SIZE * scaleFactor) / 2;
          clusterBalls[j].y = node.y + centerY - (CONFIG.CLUSTER_PACK_SIZE * scaleFactor) / 2;
          clusterBalls[j].r = node.r;
        });
        
        clusters.push({
          id: i,
          centerX: centerX,
          centerY: centerY,
          balls: clusterBalls,
          packSize: CONFIG.CLUSTER_PACK_SIZE * scaleFactor
        });
      }
      
      return clusters;
    }

    // === CLUSTER GROUP SETUP ===
    function setupClusterGroups() {
      const sixClusterGroup = svg.append("g").attr("id", "sixClusterGroup");
      
      sixClusters.forEach((cluster, clusterIndex) => {
        const clusterGroup = sixClusterGroup.append("g").attr("id", \`cluster-\${clusterIndex}\`);
        
        // Pre-render circles with r=0 and opacity=0
        clusterGroup.selectAll("g")
          .data(cluster.balls)
          .join("g")
          .each(function(d, i) {
            const group = d3.select(this);
            
            // Circle
            group.append("circle")
              .attr("cx", d.x)
              .attr("cy", d.y)
              .attr("r", 0)
              .attr("fill", d.isFirstInCluster ? CONFIG.STROKE_COLOR : "none")
              .attr("stroke", CONFIG.STROKE_COLOR)
              .attr("stroke-width", CONFIG.STROKE_WIDTH)
              .attr("opacity", 0);
            
            // Text for first ball in each cluster
            if (d.isFirstInCluster) {
              group.append("text")
                .attr("x", d.x)
                .attr("y", d.y)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "white")
                .attr("font-size", "12")
                .attr("font-weight", "bold")
                .attr("opacity", 0)
                .text(clusterIndex + 1);
            }
          });
        
        // Pre-render lines
        clusterGroup.selectAll("line")
          .data(cluster.balls.slice(1))
          .join("line")
          .attr("x1", d => d.x)
          .attr("y1", d => d.y)
          .attr("x2", d => d.x)
          .attr("y2", d => d.y)
          .attr("stroke", CONFIG.STROKE_COLOR)
          .attr("stroke-width", CONFIG.STROKE_WIDTH)
          .attr("opacity", 0);
      });
    }

    // === FORCE SIMULATION ===
    function setupForceSimulation() {
      simulation = d3.forceSimulation(currentNodes)
        .force("charge", d3.forceManyBody().strength(CONFIG.CHARGE_STRENGTH))
        .force("collision", d3.forceCollide().radius(d => d.r + CONFIG.COLLISION_PADDING))
        .force("pack", createPackForce())
        .force("center", createWeakCenterForce())
        .alpha(CONFIG.INITIAL_ALPHA)
        .alphaDecay(CONFIG.ALPHA_DECAY)
        .velocityDecay(CONFIG.VELOCITY_DECAY)
        .on("tick", updateVisualization);
    }

    function createPackForce() {
      return d3.forceX().x(getResponsiveCenterX('left')).strength(CONFIG.PACK_FORCE_STRENGTH);
    }

    function createWeakCenterForce() {
      return (alpha) => {
        if (leftAnimationComplete) return;
        if (!currentNodes || currentNodes.length === 0) return;
        
        currentNodes.forEach(node => {
          const dx = getResponsiveCenterX('left') - node.x;
          const dy = getResponsiveCenterY('left') - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = CONFIG.WEAK_CENTER_FORCE_STRENGTH * alpha;
            node.vx += dx * force;
            node.vy += dy * force;
          }
        });
      };
    }

    function updateVisualization() {
      if (leftAnimationComplete) return;
      if (!currentNodes || currentNodes.length === 0) return;
      
      mainAnimationGroup.selectAll("circle")
        .data(currentNodes)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", "none")
        .attr("stroke", CONFIG.STROKE_COLOR)
        .attr("stroke-width", CONFIG.STROKE_WIDTH);
      
      if (CONFIG.SHOW_LINES && currentNodes.length > 1) {
        mainAnimationGroup.selectAll("line")
          .data(currentNodes.slice(1))
          .join("line")
          .attr("x1", d => d.x)
          .attr("y1", d => d.y)
          .attr("x2", currentNodes[0].x)
          .attr("y2", currentNodes[0].y)
          .attr("stroke", CONFIG.STROKE_COLOR)
          .attr("stroke-width", CONFIG.STROKE_WIDTH)
          .attr("opacity", 0.3);
      }
    }

    // === INITIALIZATION ===
    function initializeAnimation() {
      // Set up responsive monitoring first
      const cleanup = setupResponsiveMonitoring();
      
      // Wait for responsive system to initialize
      setTimeout(() => {
        // Generate nodes
        nodes = generateNodes();
        currentNodes = [];
        
        // Create six clusters
        sixClusters = createSixClusters();
        
        // Set up cluster groups
        setupClusterGroups();
        
        // Start main animation
        let ballIndex = 0;
        const addBallInterval = setInterval(() => {
          if (ballIndex < nodes.length) {
            addBall();
            ballIndex++;
          } else {
            clearInterval(addBallInterval);
            startFinalSettlement();
          }
        }, CONFIG.BALL_APPEAR_DELAY);
        
        // Set up force simulation
        setupForceSimulation();
      }, 100); // Small delay to ensure responsive system is initialized
      
      return cleanup;
    }

    function addBall() {
      if (currentNodes.length < nodes.length) {
        const newNode = nodes[currentNodes.length];
        currentNodes.push(newNode);
        simulation.nodes(currentNodes);
        simulation.alpha(CONFIG.INITIAL_ALPHA).restart();
      }
    }

    function startFinalSettlement() {
      setTimeout(() => {
        leftAnimationComplete = true;
        simulation.stop();
        simulation.force("charge", null);
        simulation.force("collision", null);
        simulation.force("pack", null);
        simulation.force("center", null);
        
        showLeftSideText();
        
        setTimeout(() => {
          startRightSideAnimation();
        }, 1000);
      }, CONFIG.FINAL_SETTLEMENT_TIME);
    }

    function startRightSideAnimation() {
      const sixClusterGroup = svg.select("#sixClusterGroup");
      
      sixClusters.forEach((cluster, clusterIndex) => {
        const clusterGroup = sixClusterGroup.select(\`#cluster-\${clusterIndex}\`);
        
        setTimeout(() => {
          // Animate circles
          clusterGroup.selectAll("g")
            .each(function(d, i) {
              const group = d3.select(this);
              
              group.select("circle")
                .transition()
                .duration(800)
                .attr("r", d.r)
                .attr("opacity", 1);
              
              if (d.isFirstInCluster) {
                group.select("text")
                  .transition()
                  .duration(800)
                  .attr("opacity", 1);
              }
            });
          
          // Animate lines
          clusterGroup.selectAll("line")
            .data(cluster.balls.slice(1))
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr("x2", cluster.balls[0].x)
            .attr("y2", cluster.balls[0].y)
            .attr("opacity", 0.3);
        }, clusterIndex * 500);
      });
      
      setTimeout(() => {
        rightAnimationComplete = true;
        showRightSideText();
      }, sixClusters.length * 500 + 1000);
    }

    function showLeftSideText() {
      const mainAnimationGroup = svg.select("#mainAnimationGroup");
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      const scaleFactor = getResponsiveScaleFactor();
      const centerY = getResponsiveCenterY('left');
      
      let textOffset;
      if (isStackedLayout()) {
        textOffset = centerY * config.textOffset + getResponsiveLeftTitleYOffset();
      } else {
        textOffset = centerY + (currentCanvasDimensions.height * 0.15);
      }
      
      textOffset = Math.min(textOffset, currentCanvasDimensions.height - 20);
      
      mainAnimationGroup.append("text")
        .attr("x", getResponsiveCenterX('left'))
        .attr("y", textOffset)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", CONFIG.STROKE_COLOR)
        .attr("font-family", "Outfit, sans-serif")
        .attr("font-size", isStackedLayout() ? 14 * scaleFactor : 16 * scaleFactor)
        .attr("font-weight", "500")
        .attr("opacity", 0)
        .text("Traditional Node Distribution")
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    }

    function showRightSideText() {
      const sixClusterGroup = svg.select("#sixClusterGroup");
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      const scaleFactor = getResponsiveScaleFactor();
      const centerY = getResponsiveCenterY('right');
      
      let textOffset;
      if (isStackedLayout()) {
        textOffset = centerY * config.textOffset + getResponsiveRightTitleYOffset();
      } else {
        textOffset = centerY + (currentCanvasDimensions.height * 0.15);
      }
      
      textOffset = Math.min(textOffset, currentCanvasDimensions.height - 20);
      
      sixClusterGroup.append("text")
        .attr("x", getResponsiveCenterX('right'))
        .attr("y", textOffset)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", CONFIG.STROKE_COLOR)
        .attr("font-family", "Outfit, sans-serif")
        .attr("font-size", isStackedLayout() ? 14 * scaleFactor : 16 * scaleFactor)
        .attr("font-weight", "500")
        .attr("opacity", 0)
        .text("Cerebral Node Distribution")
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    }

    // === SVG SETUP ===
    function setupSVG() {
      svg = d3.select("#viz");
      
      // Create main animation group
      const mainAnimationGroup = svg.append("g").attr("id", "mainAnimationGroup");
      
      // Apply UI toggle
      applyUIToggle();
    }

    // === MAIN EXECUTION ===
    function main() {
      setupSVG();
      
      // Start the animation
      const cleanup = initializeAnimation();
      
      // Download functionality
      document.getElementById('downloadBtn').addEventListener('click', function() {
        const svgElement = document.getElementById('viz');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "cerebral-node-distribution.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
    }

    // Start the application
    main();
  </script>
</body>
</html>`;

    // Create an iframe to embed the HTML
    const iframe = document.createElement('iframe');
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    
    container.appendChild(iframe);

    return () => {
      if (container.contains(iframe)) {
        container.removeChild(iframe);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`d3-force-packing-container ${className}`}
      style={{
        width: '100%',
        height: '500px', // Default height, can be overridden with className
        minHeight: '400px'
      }}
    />
  );
};

export default D3ForcePacking;
