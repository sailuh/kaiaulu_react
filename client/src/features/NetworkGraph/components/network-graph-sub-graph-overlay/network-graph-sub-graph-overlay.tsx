import { DndContext } from "@dnd-kit/core";
import { FloatingPanel } from "@/components/ui/floating-overlay/floating-overlay.tsx";

import { useNetworkGraph } from "@/features/NetworkGraph/stores/network-graph-context.tsx";
import {Button, Container, Typography} from "@mui/material";

/**
 *  Overlay that appears upon entering "subgraph highlight mode" that displays information about the subgraph
 *
 *  Note:
 *  - Uses custom FloatingPanel component
 */
export const NetworkGraphSubGraphOverlay = () => {
    const { overlayOn } = useNetworkGraph();

    if (!overlayOn) return null;

    return (
        // Any draggable components created with dnd-kit must be rendered within a DndContext
        <DndContext>
            <FloatingPanel id="subgraphOverlay" title="Subgraph Details">
                <Container>
                    <Typography>
                        Total nodes:
                    </Typography>
                </Container>

                <Button variant="contained" sx={{ flex: 1 }}>
                    <Typography variant="h6">
                        Show More
                    </Typography>
                </Button>

            </FloatingPanel>
        </DndContext>
    );
};