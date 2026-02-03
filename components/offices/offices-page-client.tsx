"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { Space, SpaceStatus } from "@/lib/types";
import type { InventoryData } from "@/lib/inventory-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Plus,
  ExternalLink,
  LayoutGrid,
  List,
  Box,
  Info,
  Users,
  Building2,
  Layers,
  SquareIcon,
  DollarSign,
  Calendar,
  Globe,
  Settings,
  FileText,
  ShoppingCart,
  Tag,
  Play,
  X,
  MapPin,
  Maximize2,
  Share2,
  Building,
  User,
  CheckSquare,
  Wallet,
  BarChart3,
  Link2,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FloorPlanView } from "@/components/offices/floor-plan-view";
import { FloorPlan } from "@/components/FloorPlan";
import type { Region } from "@/components/FloorPlan";
import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

const PRICING_OPTIONS = [
  { label: "12-23 months", value: "12-23" },
  { label: "24-35 months", value: "24-35" },
  { label: "36+ months", value: "36+" },
];

const STATUS_OPTIONS: { label: string; value: SpaceStatus }[] = [
  { label: "Available", value: "available" },
  { label: "Occupied", value: "occupied" },
  { label: "Pending", value: "pending" },
  { label: "Maintenance", value: "maintenance" },
];

function OfficeCard({
  space,
  onSelect,
  getStatusBadge,
}: {
  space: Space;
  onSelect: () => void;
  getStatusBadge: (status: SpaceStatus) => React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-primary">{space.name}</span>
        {getStatusBadge(space.status)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>${space.price.toLocaleString()}/mo</span>
        <span>{space.capacity} seats</span>
        <span>Floor {space.floor}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {space.status === "occupied"
          ? `Move-out: ${space.moveOutDate || "pending"}`
          : `Available: ${space.availableFrom || "Today"}`}
      </div>
    </button>
  );
}

function SidebarNavContent({
  collapsed,
  onItemClick,
  mobileDrawer = false,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
  mobileDrawer?: boolean;
}) {
  const handleClick = () => {
    onItemClick?.();
  };
  const sectionClass = mobileDrawer ? "mb-2 md:mb-3" : "mb-2.5";
  const labelClass = mobileDrawer ? "text-[10px]" : "text-[10px]";
  const sectionHeaderClass = mobileDrawer
    ? "font-semibold text-nav-label uppercase tracking-wider"
    : "font-bold text-nav-item-active uppercase tracking-wider";
  const itemClass = cn(
    "w-full flex items-center rounded-md transition-colors",
    collapsed && "justify-center",
    mobileDrawer ? "gap-3 px-3 py-2.5 text-sm min-h-[44px] md:gap-3 md:px-3 md:py-2.5 md:text-sm" : "gap-3 px-3 py-1.5 text-sm"
  );
  const iconSize = mobileDrawer ? "h-4 w-4 md:h-[18px] md:w-[18px]" : "h-[18px] w-[18px]";
  return (
    <nav
      className={cn(
        "flex flex-col min-h-0 flex-1",
        mobileDrawer ? "overflow-hidden py-0" : "py-3 pb-4"
      )}
    >
      {/* Top sections: scrollable only on desktop sidebar; no scroll on mobile/tablet drawer */}
      <div className={cn(
        "flex flex-col min-h-0",
        mobileDrawer ? "flex-1 overflow-hidden flex-shrink min-h-0" : "flex-1 min-h-0 overflow-y-auto"
      )}>
      <div className={sectionClass}>
        {!collapsed && (
          <div className={cn(mobileDrawer ? "mb-1 px-3 md:px-4" : "mb-1 px-4")}>
            <span className={cn(sectionHeaderClass, labelClass)}>Activity</span>
          </div>
        )}
        <div className={cn("space-y-0.5", mobileDrawer && "space-y-0.5")}>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Calendar className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Reservations</span>}
          </button>
        </div>
      </div>
      <div className={sectionClass}>
        {!collapsed && (
          <div className={cn("px-4", mobileDrawer ? "mb-1 px-3 md:px-4" : "mb-1")}>
            <span className={cn(sectionHeaderClass, labelClass)}>Manage</span>
          </div>
        )}
        <div className={cn("space-y-0.5", mobileDrawer && "space-y-0.5")}>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Building className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Accounts</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <User className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Members</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Building2 className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Locations</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <CheckSquare className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Products</span>
                <ChevronUp className={cn("text-nav-label", mobileDrawer ? "h-5 w-5" : "h-4 w-4")} />
              </>
            )}
          </button>
          {!collapsed && (
            <div className={cn("space-y-0.5", mobileDrawer ? "pl-9 space-y-0.5 md:pl-10" : "pl-9 space-y-0.5")}>
              <button type="button" onClick={handleClick} className={cn("w-full text-left rounded-md transition-colors", mobileDrawer ? "px-3 py-2 text-sm text-nav-item hover:bg-nav-item-active-bg min-h-[40px] md:py-2.5" : "px-3 py-1.5 text-sm text-nav-item hover:text-nav-item-active hover:bg-nav-item-active-bg")}>
                Meeting Rooms
              </button>
              <button type="button" onClick={handleClick} className={cn("w-full text-left rounded-md transition-colors font-medium text-nav-item-active bg-nav-item-active-bg", mobileDrawer ? "px-3 py-2 text-sm min-h-[40px] md:py-2.5" : "px-3 py-1.5 text-sm")}>
                Offices
              </button>
            </div>
          )}
        </div>
      </div>
      <div className={sectionClass}>
        {!collapsed && (
          <div className={cn("px-4", mobileDrawer ? "mb-1 px-3 md:px-4" : "mb-1")}>
            <span className={cn(sectionHeaderClass, labelClass)}>Sales</span>
          </div>
        )}
        <div className={cn("space-y-0.5", mobileDrawer && "space-y-0.5")}>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Tag className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Promotions</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <FileText className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Proposals</span>}
          </button>
        </div>
      </div>
      <div className={sectionClass}>
        {!collapsed && (
          <div className={cn("px-4", mobileDrawer ? "mb-1 px-3 md:px-4" : "mb-1")}>
            <span className={cn(sectionHeaderClass, labelClass)}>Finance</span>
          </div>
        )}
        <div className={cn("space-y-0.5", mobileDrawer && "space-y-0.5")}>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Wallet className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Security Deposits</span>}
          </button>
        </div>
      </div>
      </div>
      {/* Bottom section: sticks to bottom when sidebar (not mobile drawer) */}
      <div
        className={cn(
          "border-t border-sidebar-border shrink-0",
          mobileDrawer ? "py-2 md:py-3" : "py-2.5 mt-auto"
        )}
      >
        <div className={cn("space-y-0.5", mobileDrawer && "space-y-0.5")}>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <BarChart3 className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Analytics</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Link2 className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Shortcuts</span>}
          </button>
          <button type="button" onClick={handleClick} className={cn(itemClass, "text-nav-item hover:bg-nav-item-active-bg")}>
            <Sparkles className={cn("shrink-0 text-nav-label", iconSize)} />
            {!collapsed && <span>Product Updates</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

const DEFAULT_MATTERPORT_URL =
  "https://my.matterport.com/show?play=1&lang=en-US&m=7d6o1jQBAoV&sm=2&sr=-.56,.26,.18&sp=40.78,29.58,54.57";

export function OfficesPageClient({ inventoryData }: { inventoryData: InventoryData }) {
  const { viewMode, setViewMode, currentBuilding, setCurrentBuilding, setSpaces } =
    useAppStore();
  const breakpoint = useBreakpoint();
  const showPersistentSidebar = breakpoint === "desktop";
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<string[]>(["24-35"]);
  const [selectedStatuses, setSelectedStatuses] = useState<SpaceStatus[]>([
    "available",
    "occupied",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSpaceForDrawer, setSelectedSpaceForDrawer] = useState<Space | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(24);
  const [show3DModal, setShow3DModal] = useState(false);
  const [promotionsExpanded, setPromotionsExpanded] = useState(false);
  const [floorPlanHoveredRegion, setFloorPlanHoveredRegion] = useState<Region | null>(null);
  const [floorPlanHoverCardVisible, setFloorPlanHoverCardVisible] = useState(false);
  const [floorPlanDisplayRegion, setFloorPlanDisplayRegion] = useState<Region | null>(null);
  const [floorPlanHoverPosition, setFloorPlanHoverPosition] = useState<{ x: number; y: number; containerW: number; containerH: number } | null>(null);
  const floorPlanContainerRef = useRef<HTMLDivElement>(null);
  const floorPlanHoverShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floorPlanHoverHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsPerPage = 15;

  const { buildings, spacesByLocationId, regionsByLocationId } = inventoryData;
  const prefersReducedMotion = useReducedMotion();

  // Sync currentBuilding when it's not in the buildings list (e.g. first load with new data)
  useEffect(() => {
    if (buildings.length === 0) return;
    const buildingIds = new Set(buildings.map((b) => b.id));
    if (!currentBuilding || !buildingIds.has(currentBuilding)) {
      setCurrentBuilding(buildings[0].id);
    }
  }, [buildings, currentBuilding, setCurrentBuilding]);

  // Hydrate store with spaces from inventory (for MapCanvas, ShortlistPanel, CompareView)
  useEffect(() => {
    const allSpaces = Object.values(spacesByLocationId).flat();
    setSpaces(allSpaces);
  }, [spacesByLocationId, setSpaces]);

  // Delayed show/hide for floor plan hover card (UX: reduce flicker, allow moving between regions)
  const HOVER_CARD_SHOW_MS = 280;
  const HOVER_CARD_HIDE_MS = 120;
  useEffect(() => {
    if (floorPlanHoveredRegion) {
      if (floorPlanHoverHideTimeoutRef.current) {
        clearTimeout(floorPlanHoverHideTimeoutRef.current);
        floorPlanHoverHideTimeoutRef.current = null;
      }
      floorPlanHoverShowTimeoutRef.current = setTimeout(() => {
        setFloorPlanDisplayRegion(floorPlanHoveredRegion);
        setFloorPlanHoverCardVisible(true);
        floorPlanHoverShowTimeoutRef.current = null;
      }, HOVER_CARD_SHOW_MS);
    } else {
      if (floorPlanHoverShowTimeoutRef.current) {
        clearTimeout(floorPlanHoverShowTimeoutRef.current);
        floorPlanHoverShowTimeoutRef.current = null;
      }
      floorPlanHoverHideTimeoutRef.current = setTimeout(() => {
        setFloorPlanHoverCardVisible(false);
        setFloorPlanDisplayRegion(null);
        setFloorPlanHoverPosition(null);
        floorPlanHoverHideTimeoutRef.current = null;
      }, HOVER_CARD_HIDE_MS);
    }
  }, [floorPlanHoveredRegion]);
  useEffect(() => {
    return () => {
      if (floorPlanHoverShowTimeoutRef.current) clearTimeout(floorPlanHoverShowTimeoutRef.current);
      if (floorPlanHoverHideTimeoutRef.current) clearTimeout(floorPlanHoverHideTimeoutRef.current);
    };
  }, []);

  // List-view spaces from inventory for current building
  const listSpacesForBuilding = useMemo(
    () => spacesByLocationId[currentBuilding] ?? [],
    [spacesByLocationId, currentBuilding]
  );

  // Filter spaces based on current filters
  const filteredSpaces = useMemo(() => {
    return listSpacesForBuilding.filter((space) => {
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(space.status)
      )
        return false;
      if (
        searchQuery &&
        !space.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !space.occupiedBy?.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [listSpacesForBuilding, selectedStatuses, searchQuery]);

  // Initialize expandedRows with first office expanded by default
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
    const firstSpaceId = filteredSpaces[0]?.id;
    return firstSpaceId ? new Set([firstSpaceId]) : new Set();
  });

  const currentBuildingData = buildings.find(
    (b) => b.id === currentBuilding
  );
  const currentRegions = regionsByLocationId[currentBuilding] ?? [];
  const currentSpaces = spacesByLocationId[currentBuilding] ?? [];
  const matterportUrl =
    currentSpaces.find((s) => s.matterportUrl)?.matterportUrl ?? DEFAULT_MATTERPORT_URL;

  const toggleRowExpansion = (spaceId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: SpaceStatus) => {
    switch (status) {
      case "available":
        return (
          <Badge
            variant="outline"
            className="border-primary text-primary bg-transparent font-normal"
          >
            Available
          </Badge>
        );
      case "occupied":
        return (
          <Badge className="bg-secondary text-foreground hover:bg-secondary font-normal">
            Occupied
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-amber-500 text-amber-600 bg-transparent font-normal"
          >
            Pending
          </Badge>
        );
      case "maintenance":
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground text-muted-foreground bg-transparent font-normal"
          >
            Maintenance
          </Badge>
        );
    }
  };

  const getWindowInterior = (space: Space) => {
    return space.amenities.includes("Window View") ? "Window" : "Interior";
  };

  const [listUi, setListUi] = useState<'cards' | 'table'>('table');
  const showCardsOnly = breakpoint === 'mobile';
  const showTableOnly = breakpoint === 'desktop';
  const showListToggle = !showCardsOnly && !showTableOnly;
  const useCards = showCardsOnly || (showListToggle && listUi === 'cards');

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Header - full width, above sidebar and content */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background shrink-0 gap-2">
          <div className="flex items-center min-w-0 flex-1 gap-3 sm:gap-0">
            {/* Left block: on desktop fixed width for pipe alignment; on mobile bee icon + Admin Portal */}
            <div
              className={cn(
                "flex items-center min-w-0 shrink-0",
                showPersistentSidebar && "w-[11.5rem] md:w-[11rem]",
                !showPersistentSidebar && "gap-3"
              )}
            >
              {/* Mobile: small bee icon in left corner with spacing */}
              <img
                src="/ind-logo-bee-small.png"
                alt="Industrious"
                className="h-6 w-auto shrink-0 sm:hidden mr-2"
                onError={(e) => {
                  e.currentTarget.classList.add("!hidden");
                }}
              />
              <img
                src="/ind-logo-horizontal.png"
                alt="Industrious"
                className="header-logo-img h-7 object-contain object-left w-auto max-w-[160px] shrink-0 hidden sm:block"
                onError={(e) => {
                  e.currentTarget.classList.add("!hidden");
                }}
              />
            </div>
            {/* Pipe + Admin Portal: pipe lines up with sidebar border when sidebar visible */}
            <span className="hidden sm:inline text-sm font-semibold text-muted-foreground mx-1.5 shrink-0">
              |
            </span>
            <span className="hidden sm:inline text-sm font-semibold tracking-wide truncate">
              Admin Portal
            </span>
            <span className="text-sm font-semibold tracking-wide truncate sm:hidden" aria-hidden="true">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Mobile & tablet: hamburger (nav drawer); desktop shows persistent sidebar */}
            {!showPersistentSidebar && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 lg:hidden"
                onClick={() => setNavDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-sm font-normal h-9 bg-transparent"
            >
              Go To Member Portal
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-normal h-9 gap-2 hidden sm:inline-flex"
                >
                  Evelyn Lee
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar Navigation - persistent on lg+, below header */}
        {showPersistentSidebar && (
          <aside className={cn(
            "border-r border-sidebar-border bg-sidebar flex flex-col min-h-0 transition-all duration-200 shrink-0 relative",
            sidebarCollapsed ? "w-14" : "w-52"
          )}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-4 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-sidebar border border-sidebar-border shadow-sm hover:bg-sidebar-accent hover:shadow transition-all"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-nav-label" /> : <ChevronLeft className="h-3.5 w-3.5 text-nav-label" />}
          </button>
          <SidebarNavContent collapsed={sidebarCollapsed} />
        </aside>
        )}

        {/* Nav drawer for mobile & tablet (< lg); optimized width for tablet */}
        <Sheet open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
          <SheetContent side="right" className="w-full max-w-[100vw] sm:max-w-[280px] md:max-w-[320px] p-0 flex flex-col overflow-hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full min-h-0 overflow-hidden pt-6 pb-6 px-4 md:px-5">
              <SidebarNavContent collapsed={false} onItemClick={() => setNavDrawerOpen(false)} mobileDrawer />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content - no header here */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {/* Page Header - stacks on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold shrink-0">Offices</h1>
                <span className="text-muted-foreground hidden sm:inline">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-base font-normal gap-1 h-auto min-h-[44px] p-1 sm:p-2"
                    >
                      {currentBuildingData?.name || "Select Location"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {buildings.map((building) => (
                      <DropdownMenuCheckboxItem
                        key={building.id}
                        checked={currentBuilding === building.id}
                        onCheckedChange={() => setCurrentBuilding(building.id)}
                      >
                        {building.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button className="bg-primary-dark hover:bg-primary-dark-hover text-primary-foreground gap-2 min-h-[44px] shrink-0 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New office
              </Button>
            </div>

            {/* Persistent Location Overview - Compact for desktop */}
            {(() => {
              const isOfficeOrSuite = (s: Space) => ["office", "suite"].includes(s.type);
              const officeSpaces = filteredSpaces.filter(isOfficeOrSuite);
              const totalOffices = officeSpaces.length;
              const occupiedOffices = officeSpaces.filter(s => s.status === "occupied").length;
              const availableOffices = officeSpaces.filter(s => s.status === "available").length;
              const totalSeats = officeSpaces.reduce((acc, s) => acc + s.capacity, 0);
              const occupiedSeats = officeSpaces.filter(s => s.status === "occupied").reduce((acc, s) => acc + s.capacity, 0);
              const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

              return (
                <div className="bg-white rounded-lg border border-slate-200 px-3 md:px-4 py-2.5 mb-3 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                    <div className="flex flex-wrap items-center gap-3 md:gap-5">
                      {/* Occupancy Rate - Compact */}
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shrink-0",
                          occupancyRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                          occupancyRate >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {occupancyRate}%
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Live Occupancy</p>
                          <p className="text-[11px] text-slate-500">{occupiedSeats} / {totalSeats} seats</p>
                        </div>
                      </div>
                      <div className="h-px w-8 md:h-8 md:w-px bg-slate-200 shrink-0" />
                      {/* Office Metrics - Horizontal compact */}
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base md:text-lg font-bold text-slate-900">{totalOffices}</span>
                          <span className="text-xs text-slate-500">Total</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base md:text-lg font-bold text-emerald-600">{availableOffices}</span>
                          <span className="text-xs text-slate-500">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base md:text-lg font-bold text-slate-400">{occupiedOffices}</span>
                          <span className="text-xs text-slate-500">Occupied</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 shrink-0">
                      Floor {currentBuildingData?.floors ?? 1} | {currentBuildingData?.name || "Short Hills"}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* View Tabs and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* View Mode Tabs - min touch target 44px */}
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 min-w-[44px] sm:h-9 sm:min-w-0 sm:px-3 rounded-none gap-1.5 sm:gap-2 font-normal",
                      viewMode === "list"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4 shrink-0" />
                    <span className="sm:inline">List</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 min-w-[44px] sm:h-9 sm:min-w-0 sm:px-3 rounded-none gap-1.5 sm:gap-2 font-normal border-l border-border",
                      viewMode === "2d"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("2d")}
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    <span className="sm:inline">Floor Plan</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 min-w-[44px] sm:h-9 sm:min-w-0 sm:px-3 rounded-none gap-1.5 sm:gap-2 font-normal border-l border-border",
                      viewMode === "3d"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("3d")}
                  >
                    <Box className="h-4 w-4 shrink-0" />
                    <span className="sm:inline">3D</span>
                  </Button>
                </div>

                {/* Filters - Hidden on 3D tab */}
                {viewMode === "list" && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-2 font-normal bg-transparent"
                        >
                          Pricing:{" "}
                          {selectedPricing.length > 0
                            ? `${selectedPricing.join(", ")} months`
                            : "All"}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {PRICING_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={selectedPricing.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPricing([
                                  ...selectedPricing,
                                  option.value,
                                ]);
                              } else {
                                setSelectedPricing(
                                  selectedPricing.filter((p) => p !== option.value)
                                );
                              }
                            }}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-2 font-normal bg-transparent"
                        >
                          Status{" "}
                          {selectedStatuses.length > 0
                            ? `(${selectedStatuses.length})`
                            : ""}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {STATUS_OPTIONS.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={selectedStatuses.includes(option.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStatuses([
                                  ...selectedStatuses,
                                  option.value,
                                ]);
                              } else {
                                setSelectedStatuses(
                                  selectedStatuses.filter((s) => s !== option.value)
                                );
                              }
                            }}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              {/* Search - Hidden on 3D and 2D tabs; full width on mobile */}
              {viewMode === "list" && (
                <div className="relative w-full max-w-full sm:max-w-xs md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by office name, occupant"
                    className="pl-9 h-9 min-h-[44px] sm:min-h-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === "list" && (
              <div className="flex flex-col min-h-[50vh] md:min-h-[420px] h-[calc(100vh-240px)] md:h-[calc(100vh-260px)]">
                {/* Cards / Table toggle - tablet only */}
                {showListToggle && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <div className="flex rounded-md border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setListUi('cards')}
                        className={cn(
                          "px-3 py-1.5 text-sm",
                          listUi === 'cards' ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        Cards
                      </button>
                      <button
                        type="button"
                        onClick={() => setListUi('table')}
                        className={cn(
                          "px-3 py-1.5 text-sm border-l border-border",
                          listUi === 'table' ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        Table
                      </button>
                    </div>
                  </div>
                )}
                {/* Card list - mobile and tablet when toggled */}
                {useCards && (
                  <div className="flex-1 overflow-auto">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {filteredSpaces.map((space) => (
                        <OfficeCard
                          key={space.id}
                          space={space}
                          onSelect={() => {
                            setSelectedSpaceForDrawer(space);
                            setDrawerOpen(true);
                          }}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">{filteredSpaces.length} offices</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm px-2">
                          {currentPage} / {Math.max(1, Math.ceil(filteredSpaces.length / itemsPerPage))}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage >= Math.ceil(filteredSpaces.length / itemsPerPage) || filteredSpaces.length === 0}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Table - tablet (when toggled) and desktop */}
                {!useCards && (
                <div className="border border-border rounded-lg overflow-hidden bg-card flex-1 flex flex-col min-w-0 shadow-xs">
                  <div className="overflow-x-auto flex-1 min-w-0">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow className="bg-table-header-bg hover:bg-table-header-bg">
                          <TableHead className="w-10 sticky left-0 z-10 bg-table-header-bg" />
                          <TableHead className="font-medium text-table-header-foreground sticky left-10 z-10 bg-table-header-bg min-w-[120px]">
                            Office number
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            Price
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            Seats
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            Floor
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            Window/Interior
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            Status
                          </TableHead>
                          <TableHead className="font-medium text-table-header-foreground">
                            <div className="flex items-center gap-1">
                              Available date
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Date when the space becomes available</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSpaces.map((space) => (
                          <React.Fragment key={space.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/30"
                              onClick={() => toggleRowExpansion(space.id)}
                            >
                              <TableCell className="w-10 sticky left-0 z-10 bg-card">
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    expandedRows.has(space.id) && "rotate-180"
                                  )}
                                />
                              </TableCell>
                              <TableCell className="sticky left-10 z-10 bg-card min-w-[120px]">
                                <button
                                  type="button"
                                  className="text-primary hover:underline cursor-pointer font-medium bg-transparent border-none p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSpaceForDrawer(space);
                                    setDrawerOpen(true);
                                  }}
                                >
                                  {space.name}
                                </button>
                              </TableCell>
                              <TableCell>
                                ${space.price.toLocaleString()}/mo
                              </TableCell>
                              <TableCell className="text-primary">
                                {space.capacity}
                              </TableCell>
                              <TableCell className="text-primary">
                                {space.floor}
                              </TableCell>
                              <TableCell>
                                {getWindowInterior(space)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(space.status)}
                              </TableCell>
                              <TableCell>
                                {space.status === "occupied" ? (
                                  <span className="text-muted-foreground">
                                    Move-out date
                                    <br />
                                    <span className="text-foreground">
                                      {space.moveOutDate || "pending"}
                                    </span>
                                  </span>
                                ) : (
                                  space.availableFrom || "Today"
                                )}
                              </TableCell>
                            </TableRow>
                            {expandedRows.has(space.id) && (
                              <TableRow className="bg-muted/20 hover:bg-muted/20">
                                <TableCell />
                                <TableCell colSpan={7}>
                                  <div className="py-2">
                                    {/* Details row */}
                                    <div className="grid grid-cols-6 gap-6 text-sm">
                                      {space.status === "occupied" && (
                                        <>
                                          <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">
                                              Occupied by
                                            </span>
                                            <a
                                              href={`https://admin-portal.industriousoffice.com/accounts/unit/${space.id || '67abf8ac06607405a6995136'}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline flex items-center gap-1"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {space.occupiedBy || "N/A"}
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">
                                              Next Available
                                            </span>
                                            <span className="font-medium">
                                              {space.moveOutDate
                                                ? new Date(space.moveOutDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
                                                : '6/1/26'}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                      <div>
                                        <span className="text-muted-foreground block text-xs mb-0.5">
                                          Memberships Included
                                        </span>
                                        <span className="font-medium">{space.capacity + 2}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground block text-xs mb-0.5">
                                          Meeting Room Hours
                                        </span>
                                        <span className="font-medium">{space.capacity * 2} hrs/mo</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground block text-xs mb-0.5">
                                          LSF
                                        </span>
                                        <span>{space.lsf || space.sqft}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground block text-xs mb-0.5">
                                          Product tier
                                        </span>
                                        <span>{space.productTier || "N/A"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground block text-xs mb-0.5">
                                          {space.status === "occupied"
                                            ? "Renewal date"
                                            : "Last sold on"}
                                        </span>
                                        <span>
                                          {space.status === "occupied"
                                            ? space.renewalDate || "N/A"
                                            : space.lastSoldOn || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination - Fixed at bottom */}
                  <div className="flex items-center justify-between pt-3 shrink-0 px-4 pb-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredSpaces.length} offices
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(Math.ceil(filteredSpaces.length / itemsPerPage), 3) }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            currentPage === i + 1
                              ? "bg-foreground text-background hover:bg-foreground/90"
                              : "bg-transparent"
                          )}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      {Math.ceil(filteredSpaces.length / itemsPerPage) > 3 && (
                        <>
                          <span className="px-2 text-muted-foreground">...</span>
                          <Button
                            variant={
                              currentPage === Math.ceil(filteredSpaces.length / itemsPerPage) ? "default" : "outline"
                            }
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              currentPage === Math.ceil(filteredSpaces.length / itemsPerPage)
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : "bg-transparent"
                            )}
                            onClick={() => setCurrentPage(Math.ceil(filteredSpaces.length / itemsPerPage))}
                          >
                            {Math.ceil(filteredSpaces.length / itemsPerPage)}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        disabled={currentPage === Math.ceil(filteredSpaces.length / itemsPerPage) || filteredSpaces.length === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {viewMode === "2d" && currentBuildingData?.image && (
              <div
                ref={floorPlanContainerRef}
                className="relative w-full min-h-[50vh] md:min-h-[420px] h-[calc(100vh-240px)] md:h-[calc(100vh-260px)]"
              >
                <FloorPlan
                  imageUrl={currentBuildingData.image}
                  regions={currentRegions}
                  imageWidth={currentBuildingData.floorPlanWidth}
                  imageHeight={currentBuildingData.floorPlanHeight}
                  flipY
                  onRegionClick={(region) => {
                    const space = currentSpaces.find((s) => s.name === region.id || s.id === region.id);
                    if (space) {
                      setSelectedSpaceForDrawer(space);
                      setDrawerOpen(true);
                    }
                  }}
                  onRegionHover={(region, event) => {
                    setFloorPlanHoveredRegion(region);
                    if (region && event && floorPlanContainerRef.current) {
                      const rect = floorPlanContainerRef.current.getBoundingClientRect();
                      setFloorPlanHoverPosition({
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                        containerW: rect.width,
                        containerH: rect.height,
                      });
                    }
                  }}
                />
                {/* Hover card: near cursor (or top-right fallback), delayed show/hide, animated */}
                <AnimatePresence mode="wait">
                  {floorPlanHoverCardVisible && floorPlanDisplayRegion && (() => {
                    const space = currentSpaces.find((s) => s.name === floorPlanDisplayRegion.id || s.id === floorPlanDisplayRegion.id);
                    if (!space) return null;
                    const hasMetrics = (space.capacity ?? 0) > 0 || ((space.sqft ?? space.lsf) ?? 0) > 0 || (space.price ?? 0) > 0;
                    const CARD_W = 280;
                    const CARD_H_APPROX = 180;
                    const OFFSET = 12;
                    const pos = floorPlanHoverPosition;
                    const style: React.CSSProperties = pos
                      ? (() => {
                          let left = pos.x + OFFSET;
                          let top = pos.y - OFFSET - CARD_H_APPROX;
                          if (left + CARD_W > pos.containerW) left = pos.x - OFFSET - CARD_W;
                          if (left < 0) left = OFFSET;
                          if (left + CARD_W > pos.containerW) left = pos.containerW - CARD_W - OFFSET;
                          if (top < 0) top = pos.y + OFFSET;
                          if (top + CARD_H_APPROX > pos.containerH) top = Math.max(OFFSET, pos.containerH - CARD_H_APPROX - OFFSET);
                          return { position: "absolute" as const, left, top, width: CARD_W, zIndex: 10 };
                        })()
                      : { position: "absolute" as const, top: 16, right: 16, width: CARD_W, zIndex: 10 };
                    return (
                      <motion.div
                        key={floorPlanDisplayRegion.id}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={style}
                        className={cn(
                          "z-10 bg-white rounded-xl border shadow-xl overflow-hidden",
                          "ring-1 ring-black/5",
                          space.status === "available" && "border-emerald-200/80",
                          space.status === "occupied" && "border-slate-200",
                          space.status === "pending" && "border-amber-200/80",
                          space.status === "maintenance" && "border-red-200/80"
                        )}
                        role="status"
                        aria-live="polite"
                        aria-label={`${space.name}, ${space.status}`}
                      >
                        <div
                          className={cn(
                            "px-4 py-3 border-b",
                            space.status === "available" && "bg-emerald-50/90 border-emerald-100",
                            space.status === "occupied" && "bg-slate-50/90 border-slate-100",
                            space.status === "pending" && "bg-amber-50/90 border-amber-100",
                            space.status === "maintenance" && "bg-red-50/90 border-red-100"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-semibold text-[15px] text-slate-900 truncate">{space.name}</h4>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize shrink-0",
                                space.status === "available" && "bg-emerald-100 text-emerald-700",
                                space.status === "occupied" && "bg-slate-100 text-slate-600",
                                space.status === "pending" && "bg-amber-100 text-amber-700",
                                space.status === "maintenance" && "bg-red-100 text-red-700"
                              )}
                            >
                              {space.status}
                            </span>
                          </div>
                        </div>
                        {hasMetrics && (
                          <div className="px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-600 border-b border-slate-100">
                            {(space.capacity ?? 0) > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {space.capacity} seats
                              </span>
                            )}
                            {((space.sqft ?? space.lsf) ?? 0) > 0 && (
                              <span>{(space.sqft ?? space.lsf)?.toLocaleString()} sq ft</span>
                            )}
                            {(space.price ?? 0) > 0 && (
                              <span className="font-semibold text-emerald-700">
                                ${(space.price ?? 0).toLocaleString()}/mo
                              </span>
                            )}
                          </div>
                        )}
                        <div className="px-4 py-2 bg-slate-50/80">
                          <p className="text-[11px] text-slate-500">Click for full details</p>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            )}
            {viewMode === "2d" && currentBuildingData && !currentBuildingData.image && (
              <FloorPlanView
                spaces={filteredSpaces}
                building={currentBuildingData}
                selectedTerm={selectedTerm}
                onTermChange={setSelectedTerm}
                onSpaceSelect={(space) => {
                  setSelectedSpaceForDrawer(space);
                  setDrawerOpen(true);
                }}
              />
            )}

            {viewMode === "3d" && (
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 min-h-[40vh] md:min-h-[420px] h-[50vh] md:h-[calc(100vh-260px)]">
                {/* Matterport Viewer - Primary Focus (takes most space); full width when sidebar stacks below */}
                <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <iframe
                    src={matterportUrl}
                    className="w-full h-full"
                    title="3D Matterport View"
                    allowFullScreen
                    allow="xr-spatial-tracking"
                  />
                  {/* Bottom-left overlay badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Interactive Tour
                    </div>
                  </div>
                  {/* Top-right fullscreen button */}
                  <div className="absolute top-3 right-3">
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 text-xs bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow-sm"
                      onClick={() => {
                        const iframe = document.querySelector('iframe[title="3D Matterport View"]') as HTMLIFrameElement;
                        if (iframe?.requestFullscreen) iframe.requestFullscreen();
                      }}
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Fullscreen
                    </Button>
                  </div>
                </div>

                {/* Right Sidebar - stacks below iframe on mobile/tablet */}
                <div className="w-full lg:w-56 flex flex-col gap-3 shrink-0 lg:shrink-0">
                  {/* Location Context Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a7f64] to-[#15685a] flex items-center justify-center">
                        <Box className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">3D Virtual Tour</h3>
                        <p className="text-[11px] text-slate-500">Floor {currentBuildingData?.floors ?? 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <MapPin className="h-3 w-3" />
                      <span>{currentBuildingData?.name || "101 Marietta St"}</span>
                    </div>
                  </div>

                  {/* Navigation Tips - Compact */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Controls</h4>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600">
                      <div className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-slate-100">
                        <kbd className="text-[9px] font-mono text-slate-500">Click</kbd>
                        <span>Move</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-slate-100">
                        <kbd className="text-[9px] font-mono text-slate-500">Drag</kbd>
                        <span>Look</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border border-slate-100">
                        <kbd className="text-[9px] font-mono text-slate-500">Scroll</kbd>
                        <span>Zoom</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons - Stacked, high contrast */}
                  <div className="flex-1 flex flex-col justify-end gap-2">
                    <Button
                      className="w-full h-9 bg-[#1a7f64] hover:bg-[#15685a] gap-2 text-xs font-semibold shadow-sm"
                      asChild
                    >
                      <a
                        href="https://admin-portal.industriousoffice.com/locations/67460d70262529d276de0e88"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Manage Location
                        <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                      </a>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="w-full h-9 gap-2 text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 shadow-sm"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Add to Proposal
                          <ChevronDown className="h-3 w-3 ml-auto opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <Plus className="h-3.5 w-3.5 mr-2" />
                          New Proposal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Proposal #1234</DropdownMenuItem>
                        <DropdownMenuItem>Proposal #1235</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-9 gap-1 text-xs font-medium bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(matterportUrl);
                          const btn = document.activeElement as HTMLButtonElement;
                          if (btn) {
                            btn.innerText = "Copied!";
                            setTimeout(() => {
                              btn.innerHTML = `<svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>Share`;
                            }, 1500);
                          }
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 gap-1 text-xs font-medium bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Tour
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        </div>
      </div>

      {/* Office Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full max-w-[100vw] sm:max-w-[420px] sm:w-[420px] md:w-[460px] p-0 [&>button]:top-3 [&>button]:right-3 [&>button]:z-10 [&>button]:bg-white/90 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md">
          {selectedSpaceForDrawer && (
            <div className="flex flex-col h-full">
              <SheetHeader className="sr-only">
                <SheetTitle>{selectedSpaceForDrawer.name}</SheetTitle>
              </SheetHeader>

              {/* Large Thumbnail Image with View in 3D */}
              <div className="relative h-[22vh] min-h-[160px] bg-slate-100 shrink-0">
                <img
                  src={selectedSpaceForDrawer.images?.[0] || '/images/office-rep-2-interior.webp'}
                  alt={selectedSpaceForDrawer.name}
                  className="w-full h-full object-cover"
                />
                {/* View in 3D Button */}
                <button
                  type="button"
                  onClick={() => setShow3DModal(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-full hover:bg-black/80 transition-colors"
                >
                  <Box className="h-4 w-4" />
                  <span className="text-sm font-medium">View in 3D</span>
                </button>
              </div>

              {/* Title, Code and Status */}
              <div className="px-4 pt-4 pb-3 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">{selectedSpaceForDrawer.name}</h2>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      ATLPAC{selectedSpaceForDrawer.name.match(/\d+/)?.[0] || '102'}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "shrink-0 capitalize text-xs",
                      selectedSpaceForDrawer.status === "available" && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
                      selectedSpaceForDrawer.status === "occupied" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                      selectedSpaceForDrawer.status === "pending" && "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    )}
                  >
                    {selectedSpaceForDrawer.status}
                  </Badge>
                </div>
                {selectedSpaceForDrawer.status === "occupied" && (
                  <div className="mt-2 space-y-1">
                    {selectedSpaceForDrawer.occupiedBy && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Occupied by</span>
                        <a
                          href={`https://admin-portal.industriousoffice.com/accounts/unit/${selectedSpaceForDrawer.id || '67abf8ac06607405a6995136'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          {selectedSpaceForDrawer.occupiedBy}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">Next available:</span>
                      <span className="font-medium text-slate-700">
                        {selectedSpaceForDrawer.moveOutDate
                          ? new Date(selectedSpaceForDrawer.moveOutDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
                          : '6/1/26'}
                      </span>
                    </div>
                  </div>
                )}
                {selectedSpaceForDrawer.hasPromotion && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setPromotionsExpanded(!promotionsExpanded)}
                      className="flex items-center gap-2"
                    >
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1">
                        <Tag className="h-3 w-3" />
                        Promotions Available
                      </Badge>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        promotionsExpanded && "rotate-180"
                      )} />
                    </button>
                    {promotionsExpanded && (
                      <div className="mt-2 pl-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>1-month free</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>50% Off Launch Special</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Middle Content - Grows to fill space */}
              <div className="flex-1 px-4 flex flex-col justify-evenly min-h-0">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center py-2 px-1 rounded-md bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</div>
                    <div className="text-sm font-medium mt-0.5">
                      {selectedSpaceForDrawer.windowType === 'interior' ? 'Interior' : 'Window'}
                    </div>
                  </div>
                  <div className="text-center py-2 px-1 rounded-md bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Tier</div>
                    <div className="text-sm font-medium mt-0.5">{selectedSpaceForDrawer.productTier || 'Tier 1'}</div>
                  </div>
                  <div className="text-center py-2 px-1 rounded-md bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">LSF</div>
                    <div className="text-sm font-medium mt-0.5">{selectedSpaceForDrawer.lsf || selectedSpaceForDrawer.sqft}</div>
                  </div>
                  <div className="text-center py-2 px-1 rounded-md bg-muted/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Seats</div>
                    <div className="text-sm font-medium mt-0.5">{selectedSpaceForDrawer.capacity}</div>
                  </div>
                </div>

                {/* Package Details - Enhanced for offices with 8+ seats */}
                {selectedSpaceForDrawer.capacity > 8 ? (
                  <div className="p-3 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary-muted to-white">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                      Package Includes
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-md bg-white/80">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-lg font-bold text-primary">{selectedSpaceForDrawer.capacity}</div>
                        <div className="text-[10px] text-muted-foreground">Seats</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-white/80">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-lg font-bold text-primary">{selectedSpaceForDrawer.capacity + 2}</div>
                        <div className="text-[10px] text-muted-foreground">Memberships Included</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-white/80">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1.5">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-lg font-bold text-blue-600">{selectedSpaceForDrawer.capacity * 2}</div>
                        <div className="text-[10px] text-muted-foreground">Meeting Hours Included</div>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="flex gap-4 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="w-8 h-8 rounded-md bg-primary-muted flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-base font-semibold leading-none">{selectedSpaceForDrawer.capacity + 2}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Memberships Included</div>
                      </div>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-base font-semibold leading-none">{selectedSpaceForDrawer.capacity * 2} hrs</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Meeting Hours Included</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Term Length Toggle */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Term Length</div>
                  <div className="grid grid-cols-6 gap-1 p-1 bg-muted rounded-lg">
                    {[1, 6, 12, 18, 24, 36].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSelectedTerm(term)}
                        className={cn(
                          "py-1.5 text-xs rounded-md transition-colors",
                          selectedTerm === term
                            ? "bg-white shadow-sm font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {term}mo
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-3 rounded-lg bg-primary-muted border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Monthly Rate</div>
                      <div className="text-xl font-bold text-primary">
                        ${Math.round(selectedSpaceForDrawer.price * (1 - (selectedTerm - 1) * 0.01)).toLocaleString()}/mo
                      </div>
                    </div>
                    {selectedTerm > 1 && (
                      <Badge variant="secondary" className="bg-white text-xs">
                        Save {Math.round((selectedTerm - 1) * 1)}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Total: ${(Math.round(selectedSpaceForDrawer.price * (1 - (selectedTerm - 1) * 0.01)) * selectedTerm).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* CTA Buttons - Fixed at bottom */}
              <div className="px-4 py-4 mt-auto shrink-0 border-t border-border/50 bg-background">
                <div className="space-y-2">
                  <Button className="w-full h-10 bg-primary-dark hover:bg-primary-dark-hover gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Office
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent text-xs h-9">
                          <FileText className="h-3.5 w-3.5" />
                          Add to Proposal
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          New Proposal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Proposal #1234</DropdownMenuItem>
                        <DropdownMenuItem>Proposal #1235</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent text-xs h-9">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Create Order
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1.5 bg-transparent text-xs h-9" asChild>
                    <a
                      href="https://www.industriousoffice.com/locations/101-glen-lennox-suite-300/offices/697bdd91c723b6a6cfa2b9df697bdd91c723b6a6cfa2b9d7?day=2026-03-16&monthTerm=12-month"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      View on Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 3D Modal */}
      <Dialog open={show3DModal} onOpenChange={setShow3DModal}>
        <DialogContent className="max-w-[100vw] w-full h-[90vh] sm:max-w-5xl sm:h-[80vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>3D View</DialogTitle>
          </DialogHeader>
          <button
            type="button"
            onClick={() => setShow3DModal(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <iframe
            src={matterportUrl}
            className="w-full h-full rounded-lg"
            title="3D Matterport View"
            allowFullScreen
            allow="xr-spatial-tracking"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
