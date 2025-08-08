import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Settings, Volume2, VolumeX, Sun, Moon, Laptop } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  setAnimationLevel,
  setThemeMode,
  toggleSound,
} from "@/store/features/modeSlice";
import type { RootState } from "@/store/store";
import { AnimationLevel, ThemeMode } from "@/lib/types";
import { getEnumValues } from "@/lib/utils";

export const SettingsPanel = () => {
  const dispatch = useDispatch();
  const { animationLevel, themeMode, soundEnabled } = useSelector(
    (state: RootState) => state.mode,
  );

  const handleSRAnnouncement = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("class", "sr-only");
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <Sheet>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Settings className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open settings</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Customize your experience</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div
          className="py-4 space-y-6"
          role="group"
          aria-label="Portfolio settings"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" id="animation-level-label">
              Animation Level
            </label>
            <Select
              value={animationLevel}
              onValueChange={(value: AnimationLevel) => {
                dispatch(setAnimationLevel(value));
                handleSRAnnouncement(`Animation level set to ${value}`);
              }}
              aria-labelledby="animation-level-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animation level" />
              </SelectTrigger>
              <SelectContent>
                {getEnumValues(AnimationLevel).map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" id="theme-mode-label">
              Theme
            </label>
            <Select
              value={themeMode}
              onValueChange={(value: ThemeMode) => {
                dispatch(setThemeMode(value));
                handleSRAnnouncement(`Theme set to ${value}`);
              }}
              aria-labelledby="theme-mode-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {getEnumValues(ThemeMode).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    <div className="flex items-center gap-2">
                      {mode === "light" ? (
                        <Sun className="h-4 w-4" aria-hidden="true" />
                      ) : mode === "dark" ? (
                        <Moon className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Laptop className="h-4 w-4" aria-hidden="true" />
                      )}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" id="sound-toggle-label">
              Sound
            </span>
            <Toggle
              pressed={soundEnabled}
              onPressedChange={() => {
                dispatch(toggleSound());
                handleSRAnnouncement(
                  `Sound ${soundEnabled ? "disabled" : "enabled"}`,
                );
              }}
              aria-labelledby="sound-toggle-label"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {soundEnabled ? "Disable sound" : "Enable sound"}
              </span>
            </Toggle>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
