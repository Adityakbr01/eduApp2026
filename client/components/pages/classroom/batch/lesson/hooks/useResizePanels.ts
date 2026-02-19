"use client";

import { useCallback, useRef } from "react";
import { usePanelRef, type PanelImperativeHandle } from "react-resizable-panels";

/**
 * Custom hook for panel collapse/expand via double-click.
 *
 * Behavior:
 *  - Drag handle → always resizes (handled by react-resizable-panels)
 *  - Double-click handle → toggles collapse/expand of left panel
 */

const DOUBLE_CLICK_MS = 350;
const DEFAULT_SIZE = 40;

export function useResizePanels() {
    const leftPanelRef = usePanelRef();
    const lastClickTime = useRef(0);
    const savedSize = useRef(DEFAULT_SIZE);

    const handleDoubleClick = useCallback(() => {
        const now = Date.now();
        const elapsed = now - lastClickTime.current;
        lastClickTime.current = now;

        if (elapsed < DOUBLE_CLICK_MS) {
            const panel = leftPanelRef.current;
            if (!panel) return;

            if (panel.isCollapsed()) {
                panel.expand();
                panel.resize(savedSize.current || DEFAULT_SIZE);
            } else {
                savedSize.current = panel.getSize().asPercentage;
                panel.collapse();
            }
            // Reset so triple-click doesn't re-trigger
            lastClickTime.current = 0;
        }
    }, [leftPanelRef]);

    return {
        leftPanelRef,
        handleDoubleClick,
    };
}