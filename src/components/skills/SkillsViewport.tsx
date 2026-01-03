import { ReactNode, memo } from "react";

interface SkillsViewportProps {
  children: ReactNode;
  width: number;
  height: number;
}

export const SkillsViewport = memo(function SkillsViewport({
  children,
  width,
  height,
}: SkillsViewportProps) {
  return (
    <div className="relative w-full flex items-center justify-center py-12">
      <div
        className="relative overflow-hidden rounded-lg border-2 border-iron-gold/50 shadow-arc bg-linear-to-br from-background/95 to-background/98"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: `
            0 0 20px hsl(195 100% 50% / 0.3),
            inset 0 0 20px hsl(195 100% 50% / 0.1)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
});
