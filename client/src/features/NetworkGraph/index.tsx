import Box from "@mui/material/Box";
import { Navbar } from "@/components/ui/navbar/navbar.tsx";

import { NetworkGraphProvider } from "@/features/NetworkGraph/stores/network-graph-context.tsx";
import { NetworkGraphSearchBar } from "@/features/NetworkGraph/components/network-graph-search-bar/network-graph-search-bar.tsx";
import { NetworkGraphCanvas } from "@/features/NetworkGraph/components/network-graph-canvas/network-graph-canvas.tsx";
import { NetworkGraphSubGraphOverlay } from "@/features/NetworkGraph/components/network-graph-sub-graph-overlay/network-graph-sub-graph-overlay.tsx";

/**
 *  Layout of the Network Graph
 *
 * Usage:
 * - This is to be rendered in a route (a page of the application)
 */
export const NetworkGraph = () => {
    return (
        <NetworkGraphProvider>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Navbar>
                    <NetworkGraphSearchBar/>
                </Navbar>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
                    <NetworkGraphCanvas />
                </Box>

                <NetworkGraphSubGraphOverlay/>
            </Box>
        </NetworkGraphProvider>
    )
}