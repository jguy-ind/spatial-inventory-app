export interface Region {
  id: string;
  label: string;
  location?: string;
  points: { x: number; y: number }[];
}

export type FloorPlanRotation = 0 | 90 | 180 | 270;

export interface FloorPlanProps {
  imageUrl: string;
  regions: Region[];
  onRegionClick?: (region: Region) => void;
  /** Second arg is the mouse event when entering a region (for cursor-based tooltip positioning). */
  onRegionHover?: (region: Region | null, event?: React.MouseEvent) => void;
  selectedRegionId?: string | null;
  /** Intrinsic image size in pixels; when set, viewBox is 0 0 imageWidth imageHeight for correct aspect ratio. */
  imageWidth?: number;
  imageHeight?: number;
  /** Flip Y axis (use when CSV is Y-up / CAD and image is Y-down / screen). */
  flipY?: boolean;
  /** Rotate the whole floor plan (image + overlay) by this many degrees. */
  rotationDeg?: FloorPlanRotation;
  className?: string;
}
