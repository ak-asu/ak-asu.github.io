import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import type { RootState } from "@/store/store";
import { toggleMode } from "@/store/features/modeSlice";
import { NavItems } from "@/lib/constants";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { SettingsPanel } from "./SettingsPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ContactDialog from "./ContactDialog";

export const Navbar = () => {
  const dispatch = useDispatch();
  const isTechnicalMode = useSelector(
    (state: RootState) => state.mode.isTechnicalMode,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const NavContent = () => (
    <TooltipProvider>
      <>
        {!isTechnicalMode &&
          NavItems.map((item) => (
            <motion.div key={item.label} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.href === "#contact") {
                        // document.dispatchEvent(new CustomEvent("toggle-contact-dialog", { detail: { open: true } }));
                        setIsContactDialogOpen(true);
                      } else {
                        const element = document.querySelector(item.href);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                  >
                    {item.icon && (
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{item.label}</span>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        <Button
          onClick={() => dispatch(toggleMode())}
          variant="outline"
          className="ml-4"
          aria-pressed={isTechnicalMode}
          aria-label={`Switch to ${isTechnicalMode ? "Interactive" : "Technical"} mode`}
        >
          {isTechnicalMode ? "Switch to Interactive" : "Switch to Technical"}
        </Button>
        <SettingsPanel />
      </>
    </TooltipProvider>
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold"
            >
              <a
                href="#"
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                Portfolio {`(Experimental)`}
              </a>
            </motion.div>
            <div
              className="hidden md:flex items-center space-x-4"
              role="menubar"
            >
              <NavContent />
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle navigation menu"
                  aria-expanded={isOpen}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="py-4">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <div
                  className="flex flex-col space-y-4 mt-4"
                  role="menu"
                  aria-label="Mobile navigation"
                >
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
      />
    </>
  );
};
