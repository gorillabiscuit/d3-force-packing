import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface D3ForcePackingProps {
  className?: string;
}

const D3ForcePacking: React.FC<D3ForcePackingProps> = ({ className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // === UI TOGGLE CONFIGURATION ===
  const UI_CONFIG = {
    SHOW_UI_ELEMENTS: false, // Hide UI elements for clean presentation
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // === Animation Configuration ===
    const CONFIG = {
      // === LEFT SIDE (MAIN ANIMATION) BALL SETTINGS ===
      BALL_COUNT: 60,
      BALL_SIZE_MULTIPLIER: 1,
      
      // Animation timing
      BALL_APPEAR_DELAY: 500,
      FINAL_SETTLEMENT_TIME: 8000,
      
      // Force simulation settings
      INITIAL_ALPHA: 0.3,
      ALPHA_DECAY: 0.008,
      VELOCITY_DECAY: 0.6,
      
      // Force strengths
      CHARGE_STRENGTH: -300,
      COLLISION_PADDING: 3,
      PACK_FORCE_STRENGTH: 0.1,
      WEAK_CENTER_FORCE_STRENGTH: 0.001,
      
      // Ball sizing
      USE_ABSOLUTE_SIZING: false,
      LARGE_BALL_COUNT: 8,
      LARGE_BALL_RADIUS: 25,
      SMALL_BALL_RADIUS: 8,
      LARGE_BALL_MIN_RADIUS: 15,
      LARGE_BALL_MAX_RADIUS: 120,
      SMALL_BALL_MIN_RADIUS: 5,
      SMALL_BALL_MAX_RADIUS: 15,
      
      // Right side cluster settings
      NUM_CLUSTERS: 6,
      BALLS_PER_CLUSTER: 8,
      RIGHT_CLUSTER_BALL_SIZE: 8,
      CLUSTER_RADIUS: 200,
      CLUSTER_PACK_SIZE: 120,
      
      // Visual settings
      STROKE_COLOR: "#0A61B5",
      STROKE_WIDTH: 1.5,
      SHOW_LINES: true,
      UNIFORM_BALL_SIZES: false,
      
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

    // === RESPONSIVE CONFIGURATION ===
    const BREAKPOINTS = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };

    const CONTAINER_MAX_WIDTH = 1600;

    // Tailwind-compatible responsive configuration
    const RESPONSIVE_CONFIG = {
      aspectRatio: 1400 / 700,
      breakpoints: {
        xs: { 
          maxWidth: '100vw', 
          maxHeight: '60vh',
          padding: 20,
          layout: 'stacked',
          centerYOffset: 0,
          leftAnimationYOffset: -30,
          rightAnimationYOffset: 20,
          leftTitleYOffset: 30,
          rightTitleYOffset: -200,
          textOffset: 0.8,
          leftBallSizeMultiplier: 0.6,
          leftLargeBallMultiplier: 0.5,
          clusterBallSize: 6,
          clusterRadius: 300,
          clusterPackSize: 170,
        },
        sm: { 
          maxWidth: '100vw', 
          maxHeight: '70vh',
          padding: 30,
          layout: 'stacked',
          centerYOffset: -10,
          leftAnimationYOffset: 0,
          rightAnimationYOffset: 40,
          leftTitleYOffset: 80,
          rightTitleYOffset: 0,
          textOffset: 0.4,
          leftBallSizeMultiplier: 0.7,
          leftLargeBallMultiplier: 0.5,
          clusterBallSize: 6,
          clusterRadius: 230,
          clusterPackSize: 160,
        },
        md: {
          maxWidth: '100vw',
          maxHeight: '80vh',
          padding: 40,
          layout: 'hybrid',
          centerYOffset: 0,
          textOffset: 0.3,
          leftBallSizeMultiplier: 0.8,
          leftLargeBallMultiplier: 0.7,
          clusterBallSize: 8,
          clusterRadius: 200,
          clusterPackSize: 130,
        },
        lg: {
          maxWidth: '100vw',
          maxHeight: '85vh',
          padding: 50,
          layout: 'dual',
          centerYOffset: 0,
          textOffset: 0.25,
          leftBallSizeMultiplier: 0.9,
          leftLargeBallMultiplier: 0.8,
          clusterBallSize: 9,
          clusterRadius: 180,
          clusterPackSize: 110,
        },
        xl: {
          maxWidth: '100vw',
          maxHeight: '90vh',
          padding: 60,
          layout: 'dual',
          centerYOffset: 0,
          textOffset: 0.2,
          leftBallSizeMultiplier: 1.0,
          leftLargeBallMultiplier: 0.9,
          clusterBallSize: 10,
          clusterRadius: 220,
          clusterPackSize: 120,
        },
        '2xl': {
          maxWidth: '100vw',
          maxHeight: '95vh',
          padding: 60,
          layout: 'dual',
          centerYOffset: 0,
          textOffset: 0.15,
          leftBallSizeMultiplier: 1.1,
          leftLargeBallMultiplier: 1.0,
          clusterBallSize: 14,
          clusterRadius: 220,
          clusterPackSize: 130,
        }
      }
    };

    // === RESPONSIVE SYSTEM ===
    let currentBreakpoint = 'xs';
    let currentCanvasDimensions: any = null;
    let currentLayoutParams: any = null;

    function getCurrentBreakpoint(width: number): string {
      if (width >= BREAKPOINTS['2xl']) return '2xl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    }

    function calculateCanvasDimensions() {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return null;

      // Use container dimensions instead of window dimensions
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      const availableWidth = containerWidth - (config.padding * 2);
      const availableHeight = containerHeight - (config.padding * 2);
      
      let canvasWidth, canvasHeight;
      
      if (config.layout === 'stacked') {
        canvasWidth = Math.min(availableWidth, 600);
        canvasHeight = Math.min(availableHeight * 0.8, 800);
      } else {
        const widthBasedHeight = availableWidth / RESPONSIVE_CONFIG.aspectRatio;
        const heightBasedWidth = availableHeight * RESPONSIVE_CONFIG.aspectRatio;
        
        if (widthBasedHeight <= availableHeight) {
          canvasWidth = availableWidth;
          canvasHeight = widthBasedHeight;
        } else {
          canvasWidth = heightBasedWidth;
          canvasHeight = availableHeight;
        }
        
        if (currentBreakpoint === '2xl') {
          canvasWidth = Math.min(canvasWidth, CONTAINER_MAX_WIDTH);
          canvasHeight = canvasWidth / RESPONSIVE_CONFIG.aspectRatio;
        }
      }
      
      return {
        width: Math.round(canvasWidth),
        height: Math.round(canvasHeight),
        layout: config.layout,
        padding: config.padding
      };
    }

    function updateCanvasDimensions() {
      const newDimensions = calculateCanvasDimensions();
      if (!newDimensions) return;

      currentCanvasDimensions = newDimensions;
      
      const svg = d3.select(svgRef.current);
      svg
        .attr('width', newDimensions.width)
        .attr('height', newDimensions.height);

      setDimensions(newDimensions);
    }

    function calculateResponsiveLayout() {
      if (!currentCanvasDimensions) return null;

      const canvas = currentCanvasDimensions;
      const layout = canvas.layout;
      const layoutParams: any = {};

      if (layout === 'stacked') {
        layoutParams.leftCenter = {
          x: canvas.width / 2,
          y: canvas.height / 3
        };
        layoutParams.rightCenter = {
          x: canvas.width / 2,
          y: (canvas.height / 3) * 2
        };
        layoutParams.scaleFactor = Math.min(canvas.width / 1400, canvas.height / 700) * 0.8;
        layoutParams.spacing = canvas.height * 0.4;
        layoutParams.padding = 20;
      } else if (layout === 'hybrid') {
        const leftWidth = canvas.width * 0.5;
        const rightWidth = canvas.width * 0.5;
        
        layoutParams.leftCenter = {
          x: leftWidth / 2,
          y: canvas.height / 2
        };
        layoutParams.rightCenter = {
          x: leftWidth + (rightWidth / 2),
          y: canvas.height / 2
        };
        layoutParams.scaleFactor = Math.min(canvas.width / 1400, canvas.height / 700) * 0.9;
        layoutParams.spacing = canvas.width * 0.5;
        layoutParams.padding = 30;
      } else {
        layoutParams.leftCenter = {
          x: canvas.width / 4,
          y: canvas.height / 2
        };
        layoutParams.rightCenter = {
          x: (canvas.width / 4) * 3,
          y: canvas.height / 2
        };
        layoutParams.scaleFactor = Math.min(canvas.width / 1400, canvas.height / 700) * 1.0;
        layoutParams.spacing = canvas.width / 2;
        layoutParams.padding = 50;
      }

      return layoutParams;
    }

    function updateResponsiveLayout() {
      currentLayoutParams = calculateResponsiveLayout();
    }

    // Helper functions for responsive positioning
    function getResponsiveCenterX(side: 'left' | 'right'): number {
      if (!currentLayoutParams) return 0;
      return side === 'left' ? currentLayoutParams.leftCenter.x : currentLayoutParams.rightCenter.x;
    }

    function getResponsiveCenterY(side: 'left' | 'right'): number {
      if (!currentLayoutParams) return 0;
      return side === 'left' ? currentLayoutParams.leftCenter.y : currentLayoutParams.rightCenter.y;
    }

    function getResponsiveScaleFactor(): number {
      if (!currentLayoutParams) return 1;
      return currentLayoutParams.scaleFactor;
    }

    function isStackedLayout(): boolean {
      return currentCanvasDimensions?.layout === 'stacked';
    }

    // === RESPONSIVE MONITORING ===
    function setupResponsiveMonitoring() {
      function updateResponsiveState() {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const newBreakpoint = getCurrentBreakpoint(containerRect.width);
        const breakpointChanged = newBreakpoint !== currentBreakpoint;
        
        if (breakpointChanged) {
          currentBreakpoint = newBreakpoint;
        }

        if (breakpointChanged) {
          handleResponsiveChange(true, false);
        }
      }

      function handleResponsiveChange(breakpointChanged: boolean, sizeChanged: boolean) {
        updateCanvasDimensions();
        updateResponsiveLayout();
      }

      // Initial setup
      updateResponsiveState();
      
      // Set up ResizeObserver for container changes
      const resizeObserver = new ResizeObserver(() => {
        updateResponsiveState();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      // Cleanup function
      return () => {
        resizeObserver.disconnect();
      };
    }

    // === D3 SETUP ===
    const svg = d3.select(svgRef.current);
    
    // Clear any existing content
    svg.selectAll("*").remove();
    
    // Create groups for different visualizations
    const mainAnimationGroup = svg.append("g").attr("id", "main-animation");
    const sixClusterGroup = svg.append("g").attr("id", "six-clusters");
    
    // Create DAG overlay groups
    const gInter = svg.append("g").attr("id", "intercluster");
    const gEdges = gInter.append("g").attr("class", "edges");
    const gAnim = gInter.append("g").attr("class", "anim");

    // Arrowhead definition
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", CONFIG.DAG.ARROW_SIZE)
      .attr("markerHeight", CONFIG.DAG.ARROW_SIZE)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", CONFIG.DAG.EDGE_COLOR)
      .attr("opacity", CONFIG.DAG.EDGE_OPACITY);

    // === MAIN ANIMATION SETUP ===
    let nodes: any[] = [];
    let currentNodes: any[] = [];
    let simulation: d3.Simulation<any, undefined>;
    let leftAnimationComplete = false;
    let rightAnimationComplete = false;

    // Generate initial nodes
    function generateNodes() {
      if (CONFIG.USE_ABSOLUTE_SIZING) {
        const indices = Array.from({ length: CONFIG.BALL_COUNT }, (_, i) => i);
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        
        return Array.from({ length: CONFIG.BALL_COUNT }, (_, i) => {
          const isLarge = shuffledIndices[i] < CONFIG.LARGE_BALL_COUNT;
          let baseRadius;
          
          if (isLarge) {
            baseRadius = CONFIG.LARGE_BALL_RADIUS;
            const sizeMultiplier = getResponsiveLeftLargeBallMultiplier();
            baseRadius *= sizeMultiplier;
            baseRadius = Math.max(CONFIG.LARGE_BALL_MIN_RADIUS, Math.min(baseRadius, CONFIG.LARGE_BALL_MAX_RADIUS));
          } else {
            baseRadius = CONFIG.SMALL_BALL_RADIUS;
            const sizeMultiplier = getResponsiveLeftBallSizeMultiplier();
            baseRadius *= sizeMultiplier;
            baseRadius = Math.max(CONFIG.SMALL_BALL_MIN_RADIUS, Math.min(baseRadius, CONFIG.SMALL_BALL_MAX_RADIUS));
          }
          
          return {
            id: i,
            r: baseRadius,
            isLarge: isLarge,
            x: getResponsiveCenterX('left'),
            y: getResponsiveCenterY('left'),
            vx: 0,
            vy: 0
          };
        });
      } else {
        // Use D3 pack for sizing
        const data = Array.from({ length: CONFIG.BALL_COUNT }, (_, i) => ({
          id: i,
          value: Math.random() * 50 + 10
        }));
        
        const sizeMultiplier = getResponsiveLeftBallSizeMultiplier();
        const packSize = 300 * sizeMultiplier;
        
        const pack = d3.pack()
          .size([packSize, packSize])
          .padding(3);
        
        const root = d3.hierarchy({ children: data }).sum(d => d.value);
        const packedNodes = pack(root).leaves();
        
        return packedNodes.map((d, i) => ({
          id: i,
          r: d.r,
          isLarge: i < CONFIG.LARGE_BALL_COUNT,
          x: getResponsiveCenterX('left'),
          y: getResponsiveCenterY('left'),
          vx: 0,
          vy: 0
        }));
      }
    }

    // Helper functions for responsive sizing
    function getResponsiveLeftBallSizeMultiplier(): number {
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      return config.leftBallSizeMultiplier;
    }

    function getResponsiveLeftLargeBallMultiplier(): number {
      const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
      return config.leftLargeBallMultiplier;
    }

    // === SIX CLUSTERS SETUP ===
    let sixClusters: any[] = [];

    function createSixClusters() {
      sixClusters = [];
      let ballId = 0;
      
      for (let i = 0; i < CONFIG.NUM_CLUSTERS; i++) {
        const numBalls = CONFIG.BALLS_PER_CLUSTER;
        const config = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
        
        const clusterBalls = Array.from({ length: numBalls }, () => ({
          id: ballId++,
          value: 1,
          clusterId: i,
          r: config.clusterBallSize
        }));
        
        const angle = (i * 2 * Math.PI) / CONFIG.NUM_CLUSTERS;
        const rightCenterX = getResponsiveCenterX('right');
        const rightCenterY = getResponsiveCenterY('right');
        const scaleFactor = getResponsiveScaleFactor();
        const clusterRadius = config.clusterRadius * scaleFactor;
        const centerX = rightCenterX + Math.cos(angle) * clusterRadius;
        const centerY = rightCenterY + Math.sin(angle) * clusterRadius;
        
        const cluster = {
          id: i,
          centerX: centerX,
          centerY: centerY,
          balls: clusterBalls
        };
        
        sixClusters.push(cluster);
      }
      
      // Pack balls within each cluster
      const scaleFactor = getResponsiveScaleFactor();
      sixClusters.forEach(cluster => {
        const packConfig = RESPONSIVE_CONFIG.breakpoints[currentBreakpoint];
        const packSize = packConfig.clusterPackSize * scaleFactor;
        const pack = d3.pack()
          .size([packSize, packSize])
          .padding(2);
        
        const root = d3.hierarchy({ children: cluster.balls }).sum(d => d.value);
        const packedBalls = pack(root).leaves();
        
        packedBalls.forEach((packedBall, i) => {
          const ball = cluster.balls[i];
          ball.x = packedBall.x + cluster.centerX - packSize / 2;
          ball.y = packedBall.y + cluster.centerY - packSize / 2;
        });
      });
      
      return sixClusters;
    }

    // === ANIMATION FUNCTIONS ===
    function addBall() {
      if (currentNodes.length >= nodes.length) return;
      
      const newNode = nodes[currentNodes.length];
      currentNodes.push(newNode);
      
      if (simulation) {
        simulation.nodes(currentNodes);
        simulation.alpha(CONFIG.INITIAL_ALPHA).restart();
      }
    }

    function startFinalSettlement() {
      setTimeout(() => {
        leftAnimationComplete = true;
        simulation.stop();
        simulation.force('charge', null);
        simulation.force('collision', null);
        simulation.force('pack', null);
        simulation.force('center', null);
        
        // Start right-side animation after left completes
        setTimeout(() => {
          startRightSideAnimation();
        }, 1000);
      }, CONFIG.FINAL_SETTLEMENT_TIME);
    }

    function startRightSideAnimation() {
      if (rightAnimationComplete) return;
      
      // Animate circles growing
      sixClusterGroup.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("r", d => d.r)
        .attr("opacity", 1);
      
      // Animate lines extending
      sixClusterGroup.selectAll("line")
        .transition()
        .duration(1000)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("opacity", 0.7);
      
      setTimeout(() => {
        rightAnimationComplete = true;
        startDAGAnimation();
      }, 1000);
    }

    function startDAGAnimation() {
      // Start DAG demo transaction loop
      setInterval(() => {
        runDemoTransaction();
      }, CONFIG.DAG.STEP_MS);
    }

    // === DAG ANIMATION FUNCTIONS ===
    function runDemoTransaction() {
      // Implementation for DAG demo transaction
      // This would include the commit → verify → execute animation
      console.log('DAG transaction animation running...');
    }

    // === SETUP CLUSTER GROUPS ===
    function setupClusterGroups() {
      sixClusters.forEach((cluster, i) => {
        const clusterGroup = sixClusterGroup.append("g").attr("class", `cluster-${i}`);
        
        // Pre-render circles with r=0 and opacity=0
        clusterGroup.selectAll("circle")
          .data(cluster.balls)
          .join("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", CONFIG.STROKE_COLOR)
          .attr("stroke-width", CONFIG.STROKE_WIDTH)
          .attr("opacity", 0);
        
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
      return (alpha: number) => {
        if (leftAnimationComplete) return;
        
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
      
      mainAnimationGroup.selectAll("circle")
        .data(currentNodes)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", "none")
        .attr("stroke", CONFIG.STROKE_COLOR)
        .attr("stroke-width", CONFIG.STROKE_WIDTH);
      
      if (CONFIG.SHOW_LINES) {
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
      
      return cleanup;
    }

    // Start the animation
    const cleanup = initializeAnimation();

    // Cleanup function
    return () => {
      if (cleanup) cleanup();
      if (simulation) simulation.stop();
    };

  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        style={{ 
          border: UI_CONFIG.SHOW_UI_ELEMENTS ? '1px solid #ccc' : 'none',
          display: 'block'
        }}
      />
    </div>
  );
};

export default D3ForcePacking;
