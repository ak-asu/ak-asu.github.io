import { useMemo } from "react";

export interface HexPosition {
  x: number;
  y: number;
  angle: number;
  level: number;
}

interface LayoutConfig {
  hexRadius: number;
  totalNodes: number;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate honeycomb layout positions using axial coordinates
 * Level 0: 1 node (center)
 * Level n (n > 0): n * 6 nodes in a hexagonal ring
 * Uses proper hexagonal grid geometry where hexagons touch edge-to-edge
 */
function generateHoneycombLayout(
  totalNodes: number,
  hexRadius: number,
): HexPosition[] {
  const positions: HexPosition[] = [];

  // For pointy-top hexagons with clip-path polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%):
  // - Container: width = hexRadius, height = hexRadius * 1.15
  // - Hexagon point-to-point (horizontal) = hexRadius
  // - Hexagon flat-to-flat (vertical) spans 25% to 75% = 50% of container = hexRadius * 1.15 * 0.5
  //
  // Standard honeycomb with pointy-top hexagons touching edge-to-edge:
  // - Horizontal offset per column = 0.75 * width (columns are 3/4 width apart)
  // - Vertical offset per row = 0.866 * width (rows are sqrt(3)/2 width apart)
  //
  // But our hexagons have custom dimensions, so we scale the vertical spacing:
  // - Our flat-to-flat = hexRadius * 0.575
  // - Standard flat-to-flat for width W = 0.866W
  // - Scaling factor = 0.575 / 0.866 = 0.664
  // - Our vertical spacing = 0.866 * hexRadius * (0.575/0.866) = 0.575 * hexRadius

  const horizontalSpacing = hexRadius;
  const verticalSpacing = hexRadius * 1.1;

  // Center node (level 0)
  if (totalNodes >= 1) {
    positions.push({ x: 0, y: 0, angle: 0, level: 0 });
  }

  let level = 1;
  let placedNodes = 1;

  while (placedNodes < totalNodes) {
    const nodesInLevel = level * 6;
    const nodesToPlace = Math.min(nodesInLevel, totalNodes - placedNodes);

    // Generate positions for this ring using axial coordinates
    const ringPositions: Array<{ x: number; y: number; angle: number }> = [];

    // Walk around the hexagonal ring
    // There are 6 sides, each with 'level' positions
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < level; step++) {
        // Cube coordinates for hexagonal grid
        let q = 0,
          r = 0;

        switch (side) {
          case 0:
            q = level - step;
            r = step;
            break; // NE side
          case 1:
            q = -step;
            r = level;
            break; // E side
          case 2:
            q = -level;
            r = level - step;
            break; // SE side
          case 3:
            q = -level + step;
            r = -step;
            break; // SW side
          case 4:
            q = step;
            r = -level;
            break; // W side
          case 5:
            q = level;
            r = -level + step;
            break; // NW side
        }

        // Convert axial (q, r) to Cartesian (x, y) for pointy-top hexagons
        const x = horizontalSpacing * q;
        const y = verticalSpacing * (r + q / 2);
        const angle = Math.atan2(y, x);

        ringPositions.push({ x, y, angle });
      }
    }

    // Shuffle the positions in this ring for randomness
    const shuffledPositions = shuffleArray(ringPositions);

    // Add the required number of positions
    for (let i = 0; i < nodesToPlace; i++) {
      const pos = shuffledPositions[i];
      positions.push({
        x: pos.x,
        y: pos.y,
        angle: pos.angle,
        level,
      });
    }

    placedNodes += nodesToPlace;
    level++;
  }

  return positions;
}

/**
 * Calculate the radius of the entire honeycomb structure
 */
function calculateStructureRadius(
  positions: HexPosition[],
  hexRadius: number,
): number {
  if (positions.length === 0) return 0;

  const maxDistance = Math.max(
    ...positions.map((pos) => Math.sqrt(pos.x * pos.x + pos.y * pos.y)),
  );

  // Add hexagon radius to account for node size
  return maxDistance + hexRadius;
}

/**
 * Custom hook for generating honeycomb layout
 * Returns positions and structure metadata
 */
export function useHoneycombLayout({ hexRadius, totalNodes }: LayoutConfig) {
  const layout = useMemo(() => {
    const positions = generateHoneycombLayout(totalNodes, hexRadius);
    const structureRadius = calculateStructureRadius(positions, hexRadius);
    const boundaryRadius = structureRadius * 1.75;

    return {
      positions,
      structureRadius,
      boundaryRadius,
      levels: Math.ceil(Math.sqrt(totalNodes / 6)) + 1,
    };
  }, [hexRadius, totalNodes]);

  return layout;
}
