import React, { useState } from "react";
import contact from "@/data/contact.json";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  TabletSmartphoneIcon,
} from "lucide-react";

type SocialLink = {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  darkColor: string;
};

const DEFAULT_SOCIALS: SocialLink[] = [
  {
    id: "github",
    name: "GitHub",
    url: contact.github,
    icon: <Github size={18} />,
    color: "#24292e",
    darkColor: "#ffffff",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: contact.linkedin,
    icon: <Linkedin size={18} />,
    color: "#0077b5",
    darkColor: "#0a66c2",
  },
  {
    id: "email",
    name: "Email",
    url: contact.email,
    icon: <Mail size={18} />,
    color: "#D44638",
    darkColor: "#ea4335",
  },
  {
    id: "devpost",
    name: "Devpost",
    url: contact.devpost,
    icon: <Globe size={18} />,
    color: "#FF6F00",
    darkColor: "#ff9800",
  },
  {
    id: "mobile",
    name: "Mobile",
    url: contact.additional[0],
    icon: <TabletSmartphoneIcon size={18} />,
    color: "#1DA1F2",
    darkColor: "#00acee",
  },
];

interface BoardProps {
  socials?: SocialLink[];
}

const Board: React.FC<BoardProps> = ({ socials = DEFAULT_SOCIALS }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5 z-10 p-4 min-w-[200px]">
      {socials.map((social) => {
        const isHovered = hoveredCard === social.id;

        return (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center p-3 rounded border-l-4 
              text-gray-800 dark:text-white no-underline
              transition-all duration-200 shadow-md overflow-hidden
              whitespace-nowrap text-ellipsis cursor-pointer
              w-full max-w-[220px]
              ${isHovered ? "shadow-lg" : ""}
              ${isHovered ? "-translate-x-1" : ""}
              
              md:max-w-[400px] md:w-[90%]
              ${isHovered ? "md:-translate-y-1" : ""}
              
              sm:min-w-[40px] sm:max-w-[40px] sm:justify-center
              ${isHovered ? "sm:min-w-[180px] sm:max-w-[180px] sm:justify-start" : ""}
            `}
            style={
              {
                backgroundColor: isHovered
                  ? `var(--color-${social.id}-hover)`
                  : `var(--color-${social.id}-bg)`,
                borderColor: `var(--color-${social.id}-border)`,
                [("--color-" + social.id + "-hover") as any]:
                  `${social.color}30`,
                [("--color-" + social.id + "-bg") as any]: `${social.color}15`,
                [("--color-" + social.id + "-border") as any]: social.color,
                [("--dark-color-" + social.id + "-hover") as any]:
                  `${social.darkColor}30`,
                [("--dark-color-" + social.id + "-bg") as any]:
                  `${social.darkColor}15`,
                [("--dark-color-" + social.id + "-border") as any]:
                  social.darkColor,
              } as React.CSSProperties
            }
            onMouseEnter={() => setHoveredCard(social.id)}
            onMouseLeave={() => setHoveredCard(null)}
            aria-label={`${social.name} link`}
          >
            <div className="text-xl mr-2.5 min-w-[20px] flex justify-center text-gray-700 dark:text-gray-200">
              {social.icon}
            </div>
            <span className="text-sm font-medium">{social.name}</span>
          </a>
        );
      })}
    </div>
  );
};

export default Board;
