"use client";

import React, { useMemo, useState, useCallback } from "react";
import type { Region, FloorPlanProps, RegionStatus } from "./types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<
  RegionStatus,
  { fill: string; stroke: string; hoverFill: string; hoverStroke: string }
> = {
  available: { fill: "#d1fae5", stroke: "#059669", hoverFill: "#a7f3d0", hoverStroke: "#047857" },
  occupied: { fill: "#f1f5f9", stroke: "#64748b", hoverFill: "#e2e8f0", hoverStroke: "#475569" },
  pending: { fill: "#fef3c7", stroke: "#d97706", hoverFill: "#fde68a", hoverStroke: "#b45309" },
  maintenance: { fill: "#f1f5f9", stroke: "#64748b", hoverFill: "#e2e8f0", hoverStroke: "#475569" },
};
const INACTIVE_OVERLAY_FILL = "rgba(148, 163, 184, 0.5)";

const PADDING = 20;

function useImageDimensions(imageUrl: string): { width: number; height: number } | null {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (!imageUrl) return;

    let active = true;
    const img = new Image();
    img.src = imageUrl;

    const update = () => {
      if (active) {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      update();
    } else {
      img.onload = update;
    }

    return () => {
      active = false;
      img.onload = null;
    };
  }, [imageUrl]);

  return dimensions;
}

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
  regionStatus,
  imageWidth: imageWidthProp,
  imageHeight: imageHeightProp,
  flipY = false,
  rotationDeg = 0,
  className,
}: FloorPlanProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const detectedDimensions = useImageDimensions(imageUrl);
  const bounds = useMemo(() => getBounds(regions), [regions]);

  // Use explicit props if provided; otherwise use auto-detected dimensions from image load
  const imageWidth = imageWidthProp ?? detectedDimensions?.width;
  const imageHeight = imageHeightProp ?? detectedDimensions?.height;

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

  // If we have an image URL but no dimensions yet, we're loading.
  // Avoid showing misaligned overlay (falling back to bounds) while waiting for image size.
  const isDimensionsPending = !!imageUrl && (imageWidth == null || imageHeight == null);

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
      {!isDimensionsPending && (
        <svg
          className="absolute inset-0 w-full h-full object-contain object-center"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: "none" }}
        >
          <g style={{ pointerEvents: "all" }}>
            {regions.map((region) => {
              const status: RegionStatus = regionStatus?.[region.id] ?? "available";
              const colors = STATUS_COLORS[status] ?? STATUS_COLORS.available;
              const isHovered = hoveredId === region.id || selectedRegionId === region.id;
              const isSinglePoint = region.points.length <= 1;
              const pts = region.points.map((p) =>
                transformPoint(p, flipY, flipBounds)
              );
              // Use default colors if status color is missing
              const fill = isHovered ? (colors?.hoverFill ?? "#a7f3d0") : (colors?.fill ?? "#d1fae5");
              const stroke = isHovered ? (colors?.hoverStroke ?? "#047857") : (colors?.stroke ?? "#059669");
              const strokeWidth = isHovered ? 3 : 1.5;
              const dropShadow = isHovered ? `drop-shadow(0 2px 4px rgba(0,0,0,0.15))` : undefined;

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
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-200 ease-out"
                      style={{ filter: dropShadow }}
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
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-200 ease-out"
                    style={{ filter: dropShadow }}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      )}
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
