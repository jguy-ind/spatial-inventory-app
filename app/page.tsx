"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { mockBuildings, mockSpaces } from "@/lib/mock-data";
import type { Space, SpaceStatus } from "@/lib/types";
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
import { cn } from "@/lib/utils";

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

export default function OfficesPage() {
  const { viewMode, setViewMode, currentBuilding, setCurrentBuilding } =
    useAppStore();
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
  const itemsPerPage = 15;

  // Filter spaces based on current filters
  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((space) => {
      if (space.building !== currentBuilding) return false;
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
  }, [currentBuilding, selectedStatuses, searchQuery]);

  // Initialize expandedRows with first office expanded by default
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
    const firstSpaceId = filteredSpaces[0]?.id;
    return firstSpaceId ? new Set([firstSpaceId]) : new Set();
  });

  const currentBuildingData = mockBuildings.find(
    (b) => b.id === currentBuilding
  );

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
            className="border-[#1a7f64] text-[#1a7f64] bg-transparent font-normal"
          >
            Available
          </Badge>
        );
      case "occupied":
        return (
          <Badge className="bg-[#f0f0f0] text-foreground hover:bg-[#f0f0f0] font-normal">
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

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className={cn(
        "h-screen border-r border-slate-200 bg-white flex flex-col transition-all duration-200 shrink-0 relative",
        sidebarCollapsed ? "w-14" : "w-52"
      )}>
        {/* Collapse Toggle - Positioned at edge */}
        <button 
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-slate-500" /> : <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />}
        </button>
        
        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* ACTIVITY Section */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Activity</span>
              </div>
            )}
            <div className="px-2 space-y-0.5">
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <Calendar className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Reservations</span>}
              </button>
            </div>
          </div>

          {/* MANAGE Section */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Manage</span>
              </div>
            )}
            <div className="px-2 space-y-0.5">
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <Building className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Accounts</span>}
              </button>
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <User className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Members</span>}
              </button>
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <Building2 className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Locations</span>}
              </button>
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <CheckSquare className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">Products</span>
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  </>
                )}
              </button>
              {!sidebarCollapsed && (
                <div className="pl-9 space-y-0.5">
                  <button type="button" className="w-full text-left px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                    Meeting Rooms
                  </button>
                  <button type="button" className="w-full text-left px-3 py-1.5 text-sm font-medium text-slate-900 bg-slate-100 rounded-md transition-colors">
                    Offices
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SALES Section */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sales</span>
              </div>
            )}
            <div className="px-2 space-y-0.5">
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <Tag className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Promotions</span>}
              </button>
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <FileText className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Proposals</span>}
              </button>
            </div>
          </div>

          {/* FINANCE Section */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Finance</span>
              </div>
            )}
            <div className="px-2 space-y-0.5">
              <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
                <Wallet className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                {!sidebarCollapsed && <span>Security Deposits</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-100 py-3">
          <div className="px-2 space-y-0.5">
            <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
              <BarChart3 className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              {!sidebarCollapsed && <span>Analytics</span>}
            </button>
            <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
              <Link2 className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              {!sidebarCollapsed && <span>Shortcuts</span>}
            </button>
            <button type="button" className={cn("w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors", sidebarCollapsed && "justify-center")}>
              <Sparkles className="h-[18px] w-[18px] shrink-0 text-slate-500" />
              {!sidebarCollapsed && <span>Product Updates</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background shrink-0">
          <div className="flex items-center">
            {/* Industrious Logo Icon */}
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-semibold tracking-wide">INDUSTRIOUS</span>
            <span className="text-muted-foreground mx-1.5">|</span>
            <span className="text-sm">Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-normal h-9 bg-transparent"
            >
              Go To Member Portal
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-normal h-9 gap-2"
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Offices</h1>
                <span className="text-muted-foreground">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-base font-normal gap-1 h-auto p-1"
                    >
                      {currentBuildingData?.name || "Select Location"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {mockBuildings.map((building) => (
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
              <Button className="bg-[#1a3a2f] hover:bg-[#0f2a1f] text-white gap-2">
                <Plus className="h-4 w-4" />
                New office
              </Button>
            </div>

            {/* Persistent Location Overview - Compact for desktop */}
            {(() => {
              const totalOffices = filteredSpaces.filter(s => s.type === "office" || s.type === "suite").length;
              const occupiedOffices = filteredSpaces.filter(s => (s.type === "office" || s.type === "suite") && s.status === "occupied").length;
              const availableOffices = filteredSpaces.filter(s => (s.type === "office" || s.type === "suite") && s.status === "available").length;
              const totalSeats = filteredSpaces.filter(s => s.type === "office" || s.type === "suite").reduce((acc, s) => acc + s.capacity, 0);
              const occupiedSeats = filteredSpaces.filter(s => (s.type === "office" || s.type === "suite") && s.status === "occupied").reduce((acc, s) => acc + s.capacity, 0);
              const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
              
              return (
                <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      {/* Occupancy Rate - Compact */}
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base",
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
                      
                      <div className="h-8 w-px bg-slate-200" />
                      
                      {/* Office Metrics - Horizontal compact */}
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-900">{totalOffices}</span>
                          <span className="text-xs text-slate-500">Total</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-emerald-600">{availableOffices}</span>
                          <span className="text-xs text-slate-500">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-slate-400">{occupiedOffices}</span>
                          <span className="text-xs text-slate-500">Occupied</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-[11px] text-slate-400">
                      Floor 31 | {currentBuildingData?.name || "101 Marietta St"}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* View Tabs and Filters */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                {/* View Mode Tabs */}
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 px-3 rounded-none gap-2 font-normal",
                      viewMode === "list"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 px-3 rounded-none gap-2 font-normal border-l border-border",
                      viewMode === "2d"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("2d")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    2D
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 px-3 rounded-none gap-2 font-normal border-l border-border",
                      viewMode === "3d"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setViewMode("3d")}
                  >
                    <Box className="h-4 w-4" />
                    3D
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

              {/* Search - Hidden on 3D and 2D tabs */}
              {viewMode === "list" && (
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by office name, occupant"
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === "list" && (
              <div className="flex flex-col h-[calc(100vh-260px)] min-h-[420px]">
                {/* List View Table */}
                <div className="border border-border rounded-lg overflow-hidden bg-card flex-1 flex flex-col">
                  <div className="overflow-auto flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-10" />
                          <TableHead className="font-medium text-foreground">
                            Office number
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
                            Price
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
                            Seats
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
                            Floor
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
                            Window/Interior
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
                            Status
                          </TableHead>
                          <TableHead className="font-medium text-foreground">
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
                              <TableCell className="w-10">
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    expandedRows.has(space.id) && "rotate-180"
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <button
                                  type="button"
                                  className="text-[#1a7f64] hover:underline cursor-pointer font-medium bg-transparent border-none p-0"
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
                              <TableCell className="text-[#1a7f64]">
                                {space.capacity}
                              </TableCell>
                              <TableCell className="text-[#1a7f64]">
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
                                              className="text-[#1a7f64] hover:underline flex items-center gap-1"
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

                  </div>
                
                {/* Pagination - Fixed at bottom */}
                <div className="flex items-center justify-between pt-3 shrink-0">
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
                    {Array.from({ length: Math.min(filteredSpaces.length / itemsPerPage, 3) }, (_, i) => (
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
                    {filteredSpaces.length / itemsPerPage > 3 && (
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

            {viewMode === "2d" && (
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
              <div className="flex gap-5 h-[calc(100vh-260px)] min-h-[420px]">
                {/* Matterport Viewer - Primary Focus (takes most space) */}
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <iframe
                    src="https://my.matterport.com/show/?m=8WCGaab4DrW"
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

                {/* Right Sidebar - Compact, well-organized */}
                <div className="w-56 flex flex-col gap-3 shrink-0">
                  {/* Location Context Card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a7f64] to-[#15685a] flex items-center justify-center">
                        <Box className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">3D Virtual Tour</h3>
                        <p className="text-[11px] text-slate-500">Floor 31</p>
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
                          navigator.clipboard.writeText("https://my.matterport.com/show/?m=8WCGaab4DrW");
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

      {/* Office Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[420px] sm:w-[460px] p-0 [&>button]:top-3 [&>button]:right-3 [&>button]:z-10 [&>button]:bg-white/90 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:p-1.5 [&>button]:shadow-md">
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
                          className="text-[#1a7f64] hover:underline font-medium inline-flex items-center gap-1"
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
                  <div className="p-3 rounded-lg border-2 border-[#1a7f64]/30 bg-gradient-to-br from-[#e8f5f1] to-white">
                    <div className="text-xs font-semibold text-[#1a7f64] uppercase tracking-wide mb-3">
                      Package Includes
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-md bg-white/80">
                        <div className="w-8 h-8 rounded-full bg-[#1a7f64]/10 flex items-center justify-center mx-auto mb-1.5">
                          <Users className="h-4 w-4 text-[#1a7f64]" />
                        </div>
                        <div className="text-lg font-bold text-[#1a7f64]">{selectedSpaceForDrawer.capacity}</div>
                        <div className="text-[10px] text-muted-foreground">Seats</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-white/80">
                        <div className="w-8 h-8 rounded-full bg-[#1a7f64]/10 flex items-center justify-center mx-auto mb-1.5">
                          <Users className="h-4 w-4 text-[#1a7f64]" />
                        </div>
                        <div className="text-lg font-bold text-[#1a7f64]">{selectedSpaceForDrawer.capacity + 2}</div>
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
                      <div className="w-8 h-8 rounded-md bg-[#e8f5f1] flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-[#1a7f64]" />
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
                <div className="p-3 rounded-lg bg-[#e8f5f1] border border-[#1a7f64]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Monthly Rate</div>
                      <div className="text-xl font-bold text-[#1a7f64]">
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
                  <Button className="w-full h-10 bg-[#1a3a2f] hover:bg-[#0f2a1f] gap-2">
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
        <DialogContent className="max-w-5xl h-[80vh] p-0">
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
            src="https://my.matterport.com/show/?m=fateZME8N81&play=1&ss=92&sr=-.07,.37"
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
