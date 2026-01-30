"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import type { Space, Building } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, Maximize2, Filter, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type OfficeCategory = "small" | "medium" | "large" | "xlarge";
type SpaceType = "office" | "suite" | "common" | "conference" | "coworking" | "cafe";
type SpaceStatus = "available" | "occupied" | "pending" | "maintenance";

interface Point { x: number; y: number; }

interface FloorPlanSpace {
  id: string;
  name: string;
  label: string;
  type: SpaceType;
  category: OfficeCategory | "common" | "conference" | "coworking" | "cafe";
  capacity: number;
  polygon: Point[];
  floor: number;
  status: SpaceStatus;
  price?: number;
  sqft?: number;
  windowType?: "window" | "interior";
  occupiedBy?: string;
}

interface FloorData {
  floor: number;
  spaces: FloorPlanSpace[];
  viewBox: { x: number; y: number; width: number; height: number };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_NEXT_AVAILABLE = "6/1/26";
const TERM_PRICING: Record<number, number> = { 1: 1.0, 6: 0.95, 12: 0.90, 18: 0.85, 24: 0.80, 36: 0.75 };
const TERM_OPTIONS = [1, 6, 12, 18, 24, 36];

// Status-based colors for rentable offices (vibrant and distinct)
const statusColorScheme = {
  available: { fill: "#d1fae5", stroke: "#059669", hoverFill: "#a7f3d0", label: "Available" },
  occupied: { fill: "#f1f5f9", stroke: "#64748b", hoverFill: "#e2e8f0", label: "Occupied" },
  pending: { fill: "#fef3c7", stroke: "#d97706", hoverFill: "#fde68a", label: "Pending" },
  maintenance: { fill: "#fee2e2", stroke: "#dc2626", hoverFill: "#fecaca", label: "Inactive" },
};

// Subtle neutrals for common/shared areas
const commonColorScheme = {
  common: { fill: "#f8fafc", stroke: "#cbd5e1", hoverFill: "#f1f5f9" },
  coworking: { fill: "#f8fafc", stroke: "#cbd5e1", hoverFill: "#f1f5f9" },
  conference: { fill: "#f8fafc", stroke: "#cbd5e1", hoverFill: "#f1f5f9" },
  cafe: { fill: "#f8fafc", stroke: "#cbd5e1", hoverFill: "#f1f5f9" },
};

const statusBadgeColors = {
  available: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  occupied: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  maintenance: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

// Color schemes for different categories
const colorScheme = {
  small: { fill: "#ec4899", stroke: "#eab308", hoverFill: "#fca5a5" },
  medium: { fill: "#84cc16", stroke: "#3b82f6", hoverFill: "#a3e635" },
  large: { fill: "#fbbf24", stroke: "#14b8a6", hoverFill: "#fed766" },
  xlarge: { fill: "#60a5fa", stroke: "#f43f5e", hoverFill: "#93c5fd" },
  common: commonColorScheme.common,
  conference: commonColorScheme.conference,
  coworking: commonColorScheme.coworking,
  cafe: commonColorScheme.cafe,
};

// Status colors for badges
const statusColors = {
  available: statusBadgeColors.available,
  occupied: statusBadgeColors.occupied,
  pending: statusBadgeColors.pending,
  maintenance: statusBadgeColors.maintenance,
};

// Legend items for office sizes
const legendItems = [
  { category: "small" as const, label: "Small (1-2 seats)" },
  { category: "medium" as const, label: "Medium (3-4 seats)" },
  { category: "large" as const, label: "Large (5-8 seats)" },
  { category: "xlarge" as const, label: "XLarge (9+ seats)" },
];

// Office Size Filter Options
const SIZE_FILTER_OPTIONS = [
  { category: "small" as const, label: "Small" },
  { category: "medium" as const, label: "Medium" },
  { category: "large" as const, label: "Large" },
  { category: "xlarge" as const, label: "XLarge" },
];

// ============================================================================
// ATLANTA 101 MARIETTA ST - FLOOR 31 DATA (FROM TABLEAU CSV POLYGON COORDINATES)
// ============================================================================

const atlantaMariettaFloor31: FloorData = {
  floor: 31,
  viewBox: { x: 400, y: 700, width: 3960, height: 2200 },
  spaces: [
    { id: "ATLMARSTE-A", name: "Suite A", label: "Suite A", type: "suite", category: "xlarge", capacity: 15, price: 12000, sqft: 1850, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 1428, y: 1921 }, { x: 1428, y: 1822 }, { x: 1477, y: 1822 }, { x: 1477, y: 1469 }, { x: 1426, y: 1469 }, { x: 1426, y: 1367 }, { x: 1474, y: 1367 }, { x: 1474, y: 800 }, { x: 881, y: 800 }, { x: 662, y: 1923 }] },
    { id: "ATLMARSTE-B", name: "Suite B", label: "Suite B", type: "suite", category: "xlarge", capacity: 20, price: 15000, sqft: 2400, status: "occupied", windowType: "window", occupiedBy: "Global Finance LLC", floor: 31,
      polygon: [{ x: 1579, y: 2200 }, { x: 1478, y: 2200 }, { x: 1478, y: 2153 }, { x: 1285, y: 2153 }, { x: 1285, y: 1921 }, { x: 662, y: 1923 }, { x: 498, y: 2755 }, { x: 2787, y: 2755 }, { x: 2787, y: 2151 }, { x: 2588, y: 2151 }, { x: 2588, y: 2201 }, { x: 2492, y: 2201 }, { x: 2492, y: 2150 }, { x: 1579, y: 2150 }] },
    { id: "ATLMARSTE-C", name: "Suite C", label: "Suite C", type: "suite", category: "xlarge", capacity: 12, price: 9500, sqft: 1200, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3114, y: 1317 }, { x: 3928, y: 1317 }, { x: 3826, y: 800 }, { x: 3116, y: 800 }] },
    { id: "ATLMARSTE-D", name: "Suite D", label: "Suite D", type: "suite", category: "xlarge", capacity: 10, price: 8500, sqft: 1100, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3114, y: 1317 }, { x: 2346, y: 1317 }, { x: 2346, y: 800 }, { x: 3116, y: 800 }] },
    { id: "ATLMAR001", name: "Office 1", label: "1", type: "office", category: "medium", capacity: 4, price: 2800, sqft: 280, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 2787, y: 2755 }, { x: 3211, y: 2755 }, { x: 3211, y: 2479 }, { x: 2787, y: 2479 }] },
    { id: "ATLMAR002", name: "Office 2", label: "2", type: "office", category: "medium", capacity: 4, price: 2900, sqft: 290, status: "occupied", windowType: "window", occupiedBy: "StartupXYZ", floor: 31,
      polygon: [{ x: 3211, y: 2479 }, { x: 3587, y: 2479 }, { x: 3587, y: 2753 }, { x: 3211, y: 2755 }] },
    { id: "ATLMAR003", name: "Office 3", label: "3", type: "office", category: "large", capacity: 6, price: 4200, sqft: 420, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3587, y: 2479 }, { x: 4152, y: 2479 }, { x: 4210, y: 2752 }, { x: 3587, y: 2753 }] },
    { id: "ATLMAR004", name: "Office 4", label: "4", type: "office", category: "small", capacity: 2, price: 1800, sqft: 160, status: "available", windowType: "interior", floor: 31,
      polygon: [{ x: 3328, y: 2389 }, { x: 3516, y: 2389 }, { x: 3516, y: 2150 }, { x: 3329, y: 2150 }] },
    { id: "ATLMAR005", name: "Office 5", label: "5", type: "office", category: "small", capacity: 2, price: 1750, sqft: 150, status: "occupied", windowType: "interior", occupiedBy: "Solo Consultant", floor: 31,
      polygon: [{ x: 3516, y: 2389 }, { x: 3647, y: 2389 }, { x: 3647, y: 2152 }, { x: 3516, y: 2150 }] },
    { id: "ATLMAR006", name: "Office 6", label: "6", type: "office", category: "large", capacity: 5, price: 3800, sqft: 380, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 4152, y: 2479 }, { x: 4096, y: 2202 }, { x: 3737, y: 2202 }, { x: 3737, y: 2480 }] },
    { id: "ATLMAR007", name: "Office 7", label: "7", type: "office", category: "small", capacity: 2, price: 1950, sqft: 175, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3737, y: 2202 }, { x: 3737, y: 1923 }, { x: 4046, y: 1923 }, { x: 4096, y: 2202 }] },
    { id: "ATLMAR008", name: "Office 8", label: "8", type: "office", category: "large", capacity: 5, price: 3600, sqft: 350, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3737, y: 1923 }, { x: 3737, y: 1733 }, { x: 4010, y: 1733 }, { x: 4046, y: 1923 }] },
    { id: "ATLMAR009", name: "Office 9", label: "9", type: "office", category: "medium", capacity: 3, price: 2400, sqft: 220, status: "occupied", windowType: "window", occupiedBy: "Legal Partners", floor: 31,
      polygon: [{ x: 3737, y: 1733 }, { x: 3737, y: 1551 }, { x: 3972, y: 1551 }, { x: 4010, y: 1733 }] },
    { id: "ATLMAR010", name: "Office 10", label: "10", type: "office", category: "medium", capacity: 3, price: 2500, sqft: 230, status: "available", windowType: "window", floor: 31,
      polygon: [{ x: 3737, y: 1551 }, { x: 3737, y: 1319 }, { x: 3928, y: 1317 }, { x: 3972, y: 1551 }] },
    { id: "coworking-1", name: "Coworking Area", label: "Coworking", type: "coworking", category: "coworking", capacity: 30, status: "available", floor: 31,
      polygon: [{ x: 1474, y: 800 }, { x: 2346, y: 800 }, { x: 2346, y: 1317 }, { x: 1900, y: 1317 }, { x: 1900, y: 1600 }, { x: 1600, y: 1600 }, { x: 1600, y: 1367 }, { x: 1474, y: 1367 }] },
    { id: "cafe-1", name: "Cafe/Lounge", label: "Cafe", type: "cafe", category: "cafe", capacity: 25, status: "available", floor: 31,
      polygon: [{ x: 1900, y: 1317 }, { x: 2346, y: 1317 }, { x: 2346, y: 1700 }, { x: 2100, y: 1700 }, { x: 2100, y: 1900 }, { x: 1900, y: 1900 }] },
    { id: "conf-1", name: "Conference Room", label: "Conf", type: "conference", category: "conference", capacity: 10, status: "available", floor: 31,
      polygon: [{ x: 2950, y: 2150 }, { x: 3200, y: 2150 }, { x: 3200, y: 2400 }, { x: 2950, y: 2400 }] },
  ],
};

const floorLayouts: Record<number, FloorData> = { 31: atlantaMariettaFloor31 };

// ============================================================================
// HELPERS
// ============================================================================

function polygonToPath(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map(p => `L ${p.x} ${p.y}`).join(" ")} Z`;
}

function getPolygonCenter(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function getPolygonBounds(points: Point[]): { width: number; height: number } {
  if (points.length === 0) return { width: 0, height: 0 };
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

// ============================================================================
// SPACE POLYGON COMPONENT
// ============================================================================

interface SpacePolygonProps {
  space: FloorPlanSpace;
  isHovered: boolean;
  isGreyedOut: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showPrices: boolean;
  selectedTerm: number;
}

const SpacePolygon: React.FC<SpacePolygonProps> = ({ space, isHovered, isGreyedOut, onClick, onMouseEnter, onMouseLeave, showPrices, selectedTerm }) => {
  const isRentable = space.type === "office" || space.type === "suite";
  const isCommonArea = ["common", "conference", "coworking", "cafe"].includes(space.type);
  
  // Get colors based on status for rentable spaces, or common scheme for shared areas
  const colors = isCommonArea 
    ? commonColorScheme[space.type as keyof typeof commonColorScheme] 
    : statusColorScheme[space.status];

  const path = polygonToPath(space.polygon);
  const center = getPolygonCenter(space.polygon);
  const bounds = getPolygonBounds(space.polygon);

  const fill = isHovered && isRentable ? colors.hoverFill : colors.fill;
  const strokeWidth = isRentable ? (isHovered ? 2.5 : 2) : 1;
  const opacity = isGreyedOut ? 0.15 : 1;

  // Increased font sizes for better legibility
  const LABEL_FONT_SIZE = 48;
  const PRICE_FONT_SIZE = 24;
  const COMMON_FONT_SIZE = 28;
  
  const minDim = Math.min(bounds.width, bounds.height);
  const showLabel = minDim > 80;
  const showPrice = showPrices && space.price && space.status === "available" && !isGreyedOut && isRentable;

  const getPrice = () => {
    if (!space.price) return null;
    return Math.round(space.price * (TERM_PRICING[selectedTerm] || 1));
  };

  // Label colors - dark for contrast
  const labelColor = isGreyedOut ? "#cbd5e1" : isRentable ? "#1e293b" : "#94a3b8";
  const priceColor = "#047857";

  return (
    <g 
      onClick={isRentable && !isGreyedOut ? onClick : undefined} 
      onMouseEnter={onMouseEnter} 
      onMouseLeave={onMouseLeave} 
      className={isRentable && !isGreyedOut ? "cursor-pointer" : "cursor-default"}
    >
      {/* Background polygon - status-based coloring */}
      <path 
        d={path} 
        fill={isGreyedOut ? "#f8fafc" : fill} 
        stroke={isGreyedOut ? "#e2e8f0" : colors.stroke} 
        strokeWidth={strokeWidth} 
        opacity={opacity} 
        className="transition-all duration-150"
      />
      
      {/* Labels - centered within polygon */}
      {showLabel && (
        <g className="pointer-events-none select-none">
          {/* Office name - larger, centered */}
          <text 
            x={center.x} 
            y={center.y + (showPrice ? -18 : 0)} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill={labelColor}
            fontSize={isRentable ? LABEL_FONT_SIZE : COMMON_FONT_SIZE} 
            fontWeight={700}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {space.label}
          </text>
          
          {/* Price - larger, centered below name */}
          {showPrice && (
            <text 
              x={center.x} 
              y={center.y + 28} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill={priceColor}
              fontSize={PRICE_FONT_SIZE}
              fontWeight={600}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              ${getPrice()?.toLocaleString()}/mo
            </text>
          )}
        </g>
      )}
    </g>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface FloorPlanViewProps {
  spaces: Space[];
  building?: Building;
  onSpaceSelect?: (space: Space) => void;
  selectedTerm?: number;
  onTermChange?: (term: number) => void;
}

export function FloorPlanView({ spaces, building, onSpaceSelect, selectedTerm = 24, onTermChange }: FloorPlanViewProps) {
  const { setCurrentFloor, setSelectedSpace } = useAppStore();
  // Default to floor 31 for prototype
  const currentFloor = 31;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSpace, setHoveredSpace] = useState<FloorPlanSpace | null>(null);
  const [showPrices, setShowPrices] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({ 
    minSeats: 1, 
    maxSeats: 25, 
    minPrice: 1000, 
    maxPrice: 20000, 
    statuses: [] as SpaceStatus[], 
    categories: ["small", "medium", "large", "xlarge"] as OfficeCategory[] 
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const STATUS_OPTIONS = [
    { value: "available" as const, label: "Available", color: "bg-emerald-500" },
    { value: "occupied" as const, label: "Occupied", color: "bg-slate-400" },
    { value: "pending" as const, label: "Pending", color: "bg-amber-500" },
    { value: "maintenance" as const, label: "Inactive", color: "bg-red-500" },
  ];

  const floorData = useMemo(() => floorLayouts[currentFloor] || floorLayouts[31], [currentFloor]);
  const floorSpaces = floorData.spaces;
  const viewBox = floorData.viewBox;

  const stats = useMemo(() => {
    const offices = floorSpaces.filter(s => s.type === "office" || s.type === "suite");
    return { total: offices.length, available: offices.filter(s => s.status === "available").length, occupied: offices.filter(s => s.status === "occupied").length };
  }, [floorSpaces]);

  const getSpaceFilterStatus = useCallback((space: FloorPlanSpace) => {
    if (["common", "conference", "coworking", "cafe"].includes(space.type)) return true;
    const calcPrice = space.price ? Math.round(space.price * (TERM_PRICING[selectedTerm] || 1)) : 0;
    if (space.capacity < filters.minSeats || space.capacity > filters.maxSeats) return false;
    if (calcPrice < filters.minPrice || calcPrice > filters.maxPrice) return false;
    if (!filters.categories.includes(space.category as OfficeCategory)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(space.status)) return false;
    return true;
  }, [filters, selectedTerm]);

  const hasActiveFilters = filters.minSeats > 1 || filters.maxSeats < 25 || filters.minPrice > 1000 || filters.maxPrice < 20000 || filters.statuses.length > 0 || filters.categories.length < 4;
  const clearFilters = () => setFilters({ minSeats: 1, maxSeats: 25, minPrice: 1000, maxPrice: 20000, statuses: [], categories: ["small", "medium", "large", "xlarge"] });

  const floors = [31];

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => { if (e.target === containerRef.current || e.button === 1) { setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); } };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  const handleSpaceClick = useCallback((floorSpace: FloorPlanSpace) => {
    if (floorSpace.type !== "office" && floorSpace.type !== "suite") return;
    const space: Space = { id: floorSpace.id, name: floorSpace.name, building: building?.id || "marietta-101", floor: floorSpace.floor, capacity: floorSpace.capacity, sqft: floorSpace.sqft || 0, price: floorSpace.price || 0, status: floorSpace.status, amenities: [], occupiedBy: floorSpace.occupiedBy, windowType: floorSpace.windowType || "window", moveOutDate: floorSpace.status === "occupied" ? "2026-06-01" : undefined };
    setSelectedSpace(space);
    onSpaceSelect?.(space);
  }, [building, onSpaceSelect, setSelectedSpace]);

  const svgViewBox = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card h-[calc(100vh-260px)] min-h-[420px] flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <Select value={currentFloor.toString()} onValueChange={(v) => setCurrentFloor(Number.parseInt(v))}>
            <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Select floor" /></SelectTrigger>
            <SelectContent>{floors.map((floor) => (<SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>))}</SelectContent>
          </Select>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-muted-foreground">Available:</span><span className="font-medium">{stats.available}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-muted-foreground">Occupied:</span><span className="font-medium">{stats.occupied}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1">
            <span className="text-xs text-muted-foreground px-2">Term:</span>
            {TERM_OPTIONS.map((term) => (<button key={term} type="button" onClick={() => onTermChange?.(term)} className={cn("px-2.5 py-1 text-xs rounded-md transition-colors font-medium", selectedTerm === term ? "bg-white shadow-sm text-[#1a7f64]" : "text-muted-foreground hover:text-foreground hover:bg-white/50")}>{term}mo</button>))}
          </div>
          <div className="w-px h-6 bg-border" />
          <Button variant={showPrices ? "default" : "outline"} size="sm" className={cn("h-8 gap-1.5 font-normal", showPrices ? "bg-[#1a7f64] hover:bg-[#158a6d] text-white" : "bg-transparent")} onClick={() => setShowPrices(!showPrices)}>$ Prices</Button>
          <div className="w-px h-6 bg-border" />
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild><Button variant="outline" size="sm" className={cn("h-8 gap-1.5 bg-transparent", hasActiveFilters && "border-[#1a7f64] text-[#1a7f64]")}><Filter className="h-3.5 w-3.5" />Filters{hasActiveFilters && <span className="ml-1 rounded-full bg-[#1a7f64] text-white text-[10px] px-1.5 py-0.5">Active</span>}</Button></PopoverTrigger>
            <PopoverContent className="w-[340px] p-4" align="end">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filter Offices</h4>
                  {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground hover:text-foreground">Clear all</Button>}
                </div>
                
                {/* Office Size Filter */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-slate-700">Office Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZE_FILTER_OPTIONS.map(({ category, label }) => { 
                      const isSelected = filters.categories.includes(category); 
                      return (
                        <button 
                          key={category} 
                          type="button" 
                          onClick={() => setFilters(f => ({ ...f, categories: isSelected ? f.categories.filter(c => c !== category) : [...f.categories, category] }))} 
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium transition-all border text-left",
                            isSelected 
                              ? "bg-[#1a7f64]/10 border-[#1a7f64] text-[#1a7f64]" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {label}
                        </button>
                      ); 
                    })}
                  </div>
                </div>
                
                {/* Price Range Filter - Enhanced display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Price Range</Label>
                    <span className="text-sm font-semibold text-[#1a7f64]">
                      ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="space-y-3 px-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Min</span>
                        <span>${filters.minPrice.toLocaleString()}</span>
                      </div>
                      <Slider 
                        value={[filters.minPrice]} 
                        min={1000} 
                        max={20000} 
                        step={500} 
                        onValueChange={([val]) => setFilters(f => ({ ...f, minPrice: Math.min(val, f.maxPrice - 500) }))} 
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Max</span>
                        <span>${filters.maxPrice.toLocaleString()}</span>
                      </div>
                      <Slider 
                        value={[filters.maxPrice]} 
                        min={1000} 
                        max={20000} 
                        step={500} 
                        onValueChange={([val]) => setFilters(f => ({ ...f, maxPrice: Math.max(val, f.minPrice + 500) }))} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-semibold text-slate-700">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => { 
                      const isSelected = filters.statuses.includes(status.value); 
                      return (
                        <button 
                          key={status.value} 
                          type="button" 
                          onClick={() => setFilters(f => ({ ...f, statuses: isSelected ? f.statuses.filter(s => s !== status.value) : [...f.statuses, status.value] }))} 
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                            isSelected 
                              ? "bg-[#1a7f64]/10 border-[#1a7f64] text-[#1a7f64]" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full", status.color)} />
                          {status.label}
                        </button>
                      ); 
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}><Maximize2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-slate-50" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <TooltipProvider delayDuration={0}>
          <motion.div className="w-full h-full" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center" }}>
            <svg viewBox={svgViewBox} className="w-full h-full" style={{ minHeight: "500px" }} preserveAspectRatio="xMidYMid meet">
              {/* Clean white background */}
              <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="#ffffff" />
              {floorSpaces.map((space) => {
                const passesFilter = getSpaceFilterStatus(space);
                const isGreyedOut = hasActiveFilters && !passesFilter;
                return (
                  <Tooltip key={space.id}>
                    <TooltipTrigger asChild>
                      <g><SpacePolygon space={space} isHovered={hoveredSpace?.id === space.id} isGreyedOut={isGreyedOut} onClick={() => handleSpaceClick(space)} onMouseEnter={() => setHoveredSpace(space)} onMouseLeave={() => setHoveredSpace(null)} showPrices={showPrices} selectedTerm={selectedTerm} /></g>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      sideOffset={8}
                      className="p-0 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden"
                    >
                      <div className="min-w-[220px]">
                        {/* Header with status indicator */}
                        <div className={cn(
                          "px-4 py-3 border-b",
                          space.status === "available" && "bg-emerald-50 border-emerald-100",
                          space.status === "occupied" && "bg-slate-50 border-slate-100",
                          space.status === "pending" && "bg-amber-50 border-amber-100",
                          space.status === "maintenance" && "bg-red-50 border-red-100",
                          !["office", "suite"].includes(space.type) && "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-semibold text-[15px] text-slate-900">{space.name}</h4>
                            {(space.type === "office" || space.type === "suite") && (
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize",
                                statusBadgeColors[space.status].bg, 
                                statusBadgeColors[space.status].text
                              )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full", statusBadgeColors[space.status].dot)} />
                                {space.status}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-4 py-3 space-y-2">
                          {/* Capacity and Size */}
                          <div className="flex items-center gap-4">
                            {space.capacity > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[13px] text-slate-700 font-medium">{space.capacity} seats</span>
                              </div>
                            )}
                            {space.sqft && (
                              <span className="text-[13px] text-slate-500">{space.sqft.toLocaleString()} sq ft</span>
                            )}
                          </div>
                          
                          {/* Price for available spaces */}
                          {space.price && space.status === "available" && (
                            <div className="pt-1">
                              <span className="text-lg font-bold text-[#059669]">
                                ${Math.round(space.price * (TERM_PRICING[selectedTerm] || 1)).toLocaleString()}
                              </span>
                              <span className="text-[13px] text-slate-500">/month</span>
                            </div>
                          )}
                          
                          {/* Occupant info */}
                          {space.occupiedBy && (
                            <div className="pt-1 border-t border-slate-100">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wide">Occupied by</span>
                              <p className="text-[13px] text-slate-600 font-medium mt-0.5">{space.occupiedBy}</p>
                            </div>
                          )}
                          
                          {/* Next available date */}
                          {space.status === "occupied" && (
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                              <span>Next available:</span>
                              <span className="font-medium text-slate-700">{DEFAULT_NEXT_AVAILABLE}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer hint for clickable offices */}
                        {(space.type === "office" || space.type === "suite") && (
                          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                            <span className="text-[11px] text-slate-400">Click to view details</span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </motion.div>
        </TooltipProvider>

        {/* Status Legend - Primary visual indicator */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-sm px-3 py-2.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: statusColorScheme.available.fill, border: `1.5px solid ${statusColorScheme.available.stroke}` }} />
              <span className="text-[11px] text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: statusColorScheme.occupied.fill, border: `1.5px solid ${statusColorScheme.occupied.stroke}` }} />
              <span className="text-[11px] text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: statusColorScheme.pending.fill, border: `1.5px solid ${statusColorScheme.pending.stroke}` }} />
              <span className="text-[11px] text-slate-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: statusColorScheme.maintenance.fill, border: `1.5px solid ${statusColorScheme.maintenance.stroke}` }} />
              <span className="text-[11px] text-slate-600">Inactive</span>
            </div>
          </div>
        </div>

        {/* Common Areas Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-sm px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: commonColorScheme.common.fill, border: `1px solid ${commonColorScheme.common.stroke}` }} />
            <span className="text-[11px] text-slate-500">Shared Spaces</span>
          </div>
        </div>
      </div>
    </div>
  );
}
