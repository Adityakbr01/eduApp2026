"use client";

import * as React from "react";

export function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);

        // initial check
        setMatches(media.matches);

        // listen for changes
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}