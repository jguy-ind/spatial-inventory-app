"use client";

import * as React from "react";
import {
  Calendar,
  Building,
  Building2,
  User,
  CheckSquare,
  Tag,
  FileText,
  Wallet,
  BarChart3,
  Link2,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconToggle } from "./icon-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Navigation item type definitions
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  isActive?: boolean;
  children?: NavSubItem[];
}

interface NavSubItem {
  id: string;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// Default navigation configuration
const defaultNavSections: NavSection[] = [
  {
    id: "activity",
    label: "Activity",
    items: [
      { id: "reservations", label: "Reservations", icon: Calendar },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { id: "accounts", label: "Accounts", icon: Building },
      { id: "members", label: "Members", icon: User },
      { id: "locations", label: "Locations", icon: Building2 },
      {
        id: "products",
        label: "Products",
        icon: CheckSquare,
        children: [
          { id: "meeting-rooms", label: "Meeting Rooms" },
          { id: "offices", label: "Offices", isActive: true },
        ],
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { id: "promotions", label: "Promotions", icon: Tag },
      { id: "proposals", label: "Proposals", icon: FileText },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { id: "security-deposits", label: "Security Deposits", icon: Wallet },
    ],
  },
];

const defaultBottomItems: NavItem[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "shortcuts", label: "Shortcuts", icon: Link2 },
  { id: "product-updates", label: "Product Updates", icon: Sparkles },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  navSections?: NavSection[];
  bottomItems?: NavItem[];
  activeItemId?: string;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

/**
 * AppSidebar Component
 * 
 * A fully accessible, responsive side navigation component that matches
 * the Industrious admin portal design. Features collapsible sections,
 * nested navigation items, and consistent visual hierarchy.
 * 
 * @param isCollapsed - Whether sidebar is collapsed to icon-only view
 * @param onToggle - Callback to toggle collapsed state
 * @param navSections - Navigation sections configuration
 * @param bottomItems - Items displayed at the bottom of the sidebar
 * @param activeItemId - Currently active item ID
 * @param onItemClick - Callback when an item is clicked
 */
export function AppSidebar({
  isCollapsed,
  onToggle,
  navSections = defaultNavSections,
  bottomItems = defaultBottomItems,
  activeItemId = "offices",
  onItemClick,
  className,
}: AppSidebarProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(["products"])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleItemClick = (itemId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleSection(itemId);
    } else {
      onItemClick?.(itemId);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-200 shrink-0 relative",
          isCollapsed ? "w-14" : "w-52",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Collapse Toggle */}
        <IconToggle
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          position="edge"
        />

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.id} className="mb-4">
              {/* Section Label */}
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-[10px] font-semibold text-nav-label uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
              )}

              {/* Section Items */}
              <div className="px-2 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedSections.has(item.id);
                  const isItemActive = item.isActive || activeItemId === item.id;

                  const buttonContent = (
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.id, !!hasChildren)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        isCollapsed && "justify-center",
                        isItemActive && !hasChildren
                          ? "font-medium text-nav-item-active bg-nav-item-active-bg"
                          : "text-nav-item hover:bg-nav-item-active-bg"
                      )}
                      aria-expanded={hasChildren ? isExpanded : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0 text-nav-label" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {hasChildren && (
                            isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-nav-label" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-nav-label" />
                            )
                          )}
                        </>
                      )}
                    </button>
                  );

                  return (
                    <React.Fragment key={item.id}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {buttonContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={10}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        buttonContent
                      )}

                      {/* Nested Children */}
                      {hasChildren && !isCollapsed && isExpanded && (
                        <div className="pl-9 space-y-0.5">
                          {item.children?.map((child) => {
                            const isChildActive =
                              child.isActive || activeItemId === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => onItemClick?.(child.id)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                                  isChildActive
                                    ? "font-medium text-nav-item-active bg-nav-item-active-bg"
                                    : "text-nav-item hover:text-nav-item-active hover:bg-nav-item-active-bg"
                                )}
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border py-3">
          <div className="px-2 space-y-0.5">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = item.isActive || activeItemId === item.id;

              const buttonContent = (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onItemClick?.(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                    isCollapsed && "justify-center",
                    isItemActive
                      ? "font-medium text-nav-item-active bg-nav-item-active-bg"
                      : "text-nav-item hover:bg-nav-item-active-bg"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0 text-nav-label" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <React.Fragment key={item.id}>{buttonContent}</React.Fragment>
              );
            })}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
