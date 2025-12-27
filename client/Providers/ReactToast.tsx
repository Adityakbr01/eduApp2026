"use client"
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Toaster } from 'react-hot-toast';

function ReactToast() {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <Toaster
            position={isMobile ? "bottom-center" : "top-right"}
            gutter={8} // spacing between toasts
            toastOptions={{
                duration: 3500,
                style: {
                    fontSize: "14px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontWeight: 500,
                },
                success: {
                    style: {
                        background: "hsl(142.1 76.2% 36.3%)", // green
                        color: "white",
                    },
                    iconTheme: {
                        primary: "white",
                        secondary: "hsl(142.1 76.2% 36.3%)",
                    },
                },
                error: {
                    style: {
                        background: "hsl(0 72.2% 50.6%)", // red
                        color: "white",
                    },
                    iconTheme: {
                        primary: "white",
                        secondary: "hsl(0 72.2% 50.6%)",
                    },
                },
                loading: {
                    style: {
                        background: "hsl(217.2 32.6% 17.5%)", // dark blue/gray
                        color: "white",
                    },
                },
            }}
        />
    )
}

export default ReactToast