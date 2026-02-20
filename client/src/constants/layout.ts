/**
 * Layout Constants
 * 
 * Centralized layout measurements for consistent spacing across the application.
 * These values ensure the fixed navbar never overlaps main content.
 */

export const NAVBAR_HEIGHT = {
  /** Mobile navbar height in pixels (h-20) */
  MOBILE: 80,
  /** Desktop navbar height in pixels (h-24 at md breakpoint) */
  DESKTOP: 96,
} as const;

/**
 * Tailwind CSS classes for navbar height
 * Use these for consistent styling across components
 */
export const NAVBAR_CLASSES = {
  /** Height classes matching Nav component */
  HEIGHT: "h-20 md:h-24",
  /** Padding-top to offset fixed navbar on mobile */
  PADDING_TOP_MOBILE: "pt-20",
  /** Padding-top to offset fixed navbar on desktop */
  PADDING_TOP_DESKTOP: "md:pt-24",
  /** Combined padding-top for responsive layout */
  PADDING_TOP: "pt-20 md:pt-24",
} as const;

/**
 * Routes that should NOT display the main navigation bar
 * Dashboard pages have their own sidebar navigation
 */
export const ROUTES_WITHOUT_NAVBAR = [
  "/dashboard",
  "/signin",
  "/reset-password",
  "/signup",
  "/email-not-verified",
  "/classroom",
  "/course/"
] as const;


export const ROUTES_WITHOUT_LENIS = [
  "/dashboard",
  "/signin",
  "/reset-password",
  "/signup",
  "/email-not-verified",
  "/classroom",
] as const;

/**
 * Check if a pathname should hide the main navbar
 * @param pathname - Current route pathname
 * @returns true if navbar should be hidden
 */
export function shouldHideNavbar(pathname: string): boolean {
  return ROUTES_WITHOUT_NAVBAR.some(route => pathname.startsWith(route));
}

const layoutConstants = {
  NAVBAR_HEIGHT,
  NAVBAR_CLASSES,
  ROUTES_WITHOUT_NAVBAR,
  shouldHideNavbar,
};

export default layoutConstants;
