/*

This file defines a custom React hook that determines whether the current 
viewport should be considered "mobile" based on a fixed breakpoint

It provides a simple boolean flag (`true` / `false`) that components can use to:
    - Adjust layout
    - Toggle UI behavior
    - Conditionally render mobile-specific components

 */

// Import React namespace to access hooks (useState, useEffect)
import * as React from "react";

/*
Mobile breakpoint definition
    - Any viewport width strictly LESS THAN this value is considered "mobile"
 */
const MOBILE_BREAKPOINT = 768;

/*
useIsMobile Hook

Returns a boolean:
    - true: viewport is mobile sized 
    - false: viewport is desktop sized
 */
export function useIsMobile() {

  /* State: isMobile
      - Tracks whether the current viewport is considered mobile
      - Initial value is undefined to indicate uninitialized state
   */
  const [isMobile, setIsMobile] =
    React.useState<boolean | undefined>(undefined);

  /* Effect: viewport size tracking */
  React.useEffect(() => {

    /* 
    Create a MediaQueryList for widths below the breakpoint.
    
    Subtract 1px so the breakpoint is exclusive:
        < 768px → mobile
        >= 768px → not mobile
     */
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    /*
    Handler called whenever the media query match changes
    
    This ensures:
        - Resizing the window updates state
        - Orientation changes on mobile are handled
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Register the listener for viewport changes
    mql.addEventListener("change", onChange);

    /*
    Set initial value immediately on mount
    Ensures correct state even before the first "change" event fires
     */
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Clean up
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []); // Empty array ensures this effect runs only once

  return !!isMobile;
}
