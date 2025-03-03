import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Menu, Home, FolderKanban, School, BriefcaseBusiness, Trophy, PencilRuler } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { toggleMode } from '../store/features/modeSlice';
import { SettingsPanel } from './SettingsPanel';
import type { RootState } from '../store/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export const Navbar = () => {
  const dispatch = useDispatch();
  const isTechnicalMode = useSelector((state: RootState) => state.mode.isTechnicalMode);
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#main-content', icon: Home },
    { label: 'Education', href: '#education', icon: School },
    { label: 'Skills', href: '#skills', icon: PencilRuler },
    { label: 'Projects', href: '#projects', icon: FolderKanban },
    { label: 'Work', href: '#work', icon: BriefcaseBusiness },
    { label: 'Achievements', href: '#achievements', icon: Trophy },
    { label: 'Contact', href: '#contact', icon: Phone },
  ];

  // Skip to main content link for keyboard users
  const SkipLink = () => (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-primary-foreground px-4 py-2 z-50"
    >
      Skip to main content
    </a>
  );

  const NavContent = () => (
    <TooltipProvider>
      <>
        {!isTechnicalMode && navItems.map((item) => (
          <motion.div key={item.label} className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.a
                  href={item.href}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2"
                  role="menuitem"
                >
                  {item.icon && <item.icon className="w-4 h-4" aria-hidden="true" />}
                </motion.a>
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
          aria-label={`Switch to ${isTechnicalMode ? 'Interactive' : 'Technical'} mode`}
        >
          {isTechnicalMode ? 'Switch to Interactive' : 'Switch to Technical'}
        </Button>
        <SettingsPanel />
      </>
    </TooltipProvider>
  );

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
      role="navigation"
      aria-label="Main navigation"
    >
      <SkipLink />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold"
          >
            <a href="#" className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
              Portfolio
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center space-x-4"
            role="menubar"
          >
            <NavContent />
          </div>

          {/* Mobile Navigation */}
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
              <div 
                className="flex flex-col space-y-4 mt-8"
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
  );
};