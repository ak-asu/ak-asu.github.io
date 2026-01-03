import { memo } from "react";
import { SkillHexagon } from "./SkillHexagon";
import type { HexPosition } from "../../hooks/useHoneycombLayout";

interface Skill {
  name: string;
  icon: string;
  category: string;
  color: string;
}

interface HoneycombLayoutProps {
  skills: Skill[];
  positions: HexPosition[];
  hexSize: number;
}

export const HoneycombLayout = memo(function HoneycombLayout({
  skills,
  positions,
  hexSize,
}: HoneycombLayoutProps) {
  return (
    <>
      {skills.map((skill, index) => {
        const position = positions[index];
        if (!position) return null;

        return (
          <SkillHexagon
            key={skill.name}
            skill={skill}
            x={position.x}
            y={position.y}
            size={hexSize}
            index={index}
          />
        );
      })}
    </>
  );
});
