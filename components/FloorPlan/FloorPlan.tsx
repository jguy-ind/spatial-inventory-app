"use client";

import React, { useMemo, useState, useCallback } from "react";
import type { Region, FloorPlanProps } from "./types";
import { cn } from "@/lib/utils";

const PADDING = 20;

function getBounds(regions: Region[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of regions) {
    for (const p of r.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;
  if (maxX === -Infinity) maxX = 1;
  if (maxY === -Infinity) maxY = 1;
  return {
    minX: minX - PADDING,
    minY: minY - PADDING,
    maxX,
    maxY,
    width: maxX - minX + PADDING * 2,
    height: maxY - minY + PADDING * 2,
  };
}

function transformPoint(
  p: { x: number; y: number },
  flipY: boolean,
  flipBounds: { minY: number; maxY: number } | { imageHeight: number }
): { x: number; y: number } {
  if (!flipY) return p;
  const y =
    "imageHeight" in flipBounds
      ? flipBounds.imageHeight - p.y
      : flipBounds.minY + flipBounds.maxY - p.y;
  return { x: p.x, y };
}

function pointsToPolygonPoints(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function FloorPlan({
  imageUrl,
  regions,
  onRegionClick,
  onRegionHover,
  selectedRegionId,
  imageWidth,
  imageHeight,
  flipY = false,
  rotationDeg = 0,
  className,
}: FloorPlanProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const bounds = useMemo(() => getBounds(regions), [regions]);
  const viewBox = useMemo(() => {
    if (imageWidth != null && imageHeight != null) {
      return `0 0 ${imageWidth} ${imageHeight}`;
    }
    return `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`;
  }, [bounds, imageWidth, imageHeight]);
  const dataMinY = bounds.minY + PADDING;
  const dataMaxY = bounds.maxY;
  const flipBounds =
    imageHeight != null
      ? { imageHeight }
      : { minY: dataMinY, maxY: dataMaxY };

  const handleMouseEnter = useCallback(
    (region: Region, e: React.MouseEvent) => {
      setHoveredId(region.id);
      onRegionHover?.(region, e);
    },
    [onRegionHover]
  );
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      setHoveredId(null);
      onRegionHover?.(null, e);
    },
    [onRegionHover]
  );

  const content = (
    <>
      {/* Background image - same aspect as SVG via object-fit contain */}
      <img
        src={imageUrl}
        alt="Floor plan"
        className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
      />
      {/* SVG overlay - same viewBox as coordinate space so polygons align */}
      <svg
        className="absolute inset-0 w-full h-full object-contain object-center"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: "none" }}
      >
        <g style={{ pointerEvents: "all" }}>
          {regions.map((region) => {
            const isHovered = hoveredId === region.id || selectedRegionId === region.id;
            const isSinglePoint = region.points.length <= 1;
            const pts = region.points.map((p) =>
              transformPoint(p, flipY, flipBounds)
            );
            if (isSinglePoint && pts.length === 1) {
              const [p] = pts;
              const r = 8;
              return (
                <g
                  key={region.id}
                  onClick={() => onRegionClick?.(region)}
                  onMouseEnter={(e) => handleMouseEnter(region, e)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={isHovered ? "rgba(26, 127, 100, 0.45)" : "rgba(26, 127, 100, 0.2)"}
                    stroke={isHovered ? "#0f5c4a" : "#1a7f64"}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-all duration-200 ease-out"
                    style={{ filter: isHovered ? "drop-shadow(0 2px 4px rgba(26, 127, 100, 0.3))" : undefined }}
                  />
                </g>
              );
            }
            if (pts.length < 2) return null;
            const pointsStr = pointsToPolygonPoints(pts);
            return (
              <g
                key={region.id}
                onClick={() => onRegionClick?.(region)}
                onMouseEnter={(e) => handleMouseEnter(region, e)}
                onMouseLeave={handleMouseLeave}
                className="cursor-pointer"
              >
                <polygon
                  points={pointsStr}
                  fill={isHovered ? "rgba(26, 127, 100, 0.38)" : "rgba(26, 127, 100, 0.15)"}
                  stroke={isHovered ? "#0f5c4a" : "#1a7f64"}
                  strokeWidth={isHovered ? 3 : 1.5}
                  className="transition-all duration-200 ease-out"
                  style={{ filter: isHovered ? "drop-shadow(0 2px 4px rgba(26, 127, 100, 0.25))" : undefined }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-muted/30 min-h-[50vh] md:min-h-[420px] h-[calc(100vh-240px)] md:h-[calc(100vh-260px)]",
        className
      )}
    >
      {rotationDeg !== 0 ? (
        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
}
