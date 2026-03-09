import { cn } from "@/lib/utils";
import { COLOURS, type ColourDef } from "@/utils/colours";

interface ColourTileProps {
  colour: ColourDef;
  colourBlind: boolean;
  index: number; // 1-based for data-ocid
  onDragStart: (colourId: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function ColourTile({
  colour,
  colourBlind,
  index,
  onDragStart,
  size = "md",
}: ColourTileProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-11 h-11 sm:w-14 sm:h-14 rounded-xl",
    lg: "w-14 h-14 rounded-xl",
  };

  return (
    <div
      data-ocid={`palette.item.${index}`}
      className={cn(
        "colour-tile flex items-center justify-center shadow-md",
        sizeClasses[size],
      )}
      style={{ background: colour.hex }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("colourId", String(colour.id));
        onDragStart(colour.id);
      }}
      title={colour.name}
      aria-label={`Drag ${colour.name}`}
    >
      {colourBlind && (
        <span className="cb-label" style={{ color: colour.textColour }}>
          {colour.cbLabel}
        </span>
      )}
    </div>
  );
}

// Inline mini colour swatch (used inside board cells)
interface ColourSwatchProps {
  colourId: number;
  colourBlind: boolean;
  className?: string;
}

export function ColourSwatch({
  colourId,
  colourBlind,
  className,
}: ColourSwatchProps) {
  const colour = COLOURS.find((c) => c.id === colourId);
  if (!colour) return null;
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className,
      )}
      style={{ background: colour.hex }}
    >
      {colourBlind && (
        <span className="cb-label" style={{ color: colour.textColour }}>
          {colour.cbLabel}
        </span>
      )}
    </div>
  );
}
