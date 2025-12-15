import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDndMonitor } from '@dnd-kit/core';
import { useState, type ReactNode, type FC, type CSSProperties } from "react";
import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

type FloatingPanelProps = {
    /**
     *  Passed to the useDraggable hook from dnd-kit to establish the component as 'draggable' and distinguish it
     */
    id: string;

    /**
     *  Optional title text displayed on the panel
     */
    title?: ReactNode;

    /**
     *  Optional components to be rendered within the panel
     */
    children?: ReactNode;
};

/**
 *  A draggable panel component.
 */
export const FloatingPanel: FC<FloatingPanelProps> = ({ title, children, id }) => {
    // Initial position of the panel
    const [position, setPosition] = useState({ x: 16, y: 16 });

    // Hook that exposes constants necessary for dragging the component
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    // Listener for drag and drop events
    useDndMonitor({
        onDragEnd(event) {
            if (event.active.id !== id) return;
            const { delta } = event;

            setPosition((prev) => ({
                x: prev.x + delta.x,
                y: prev.y + delta.y,
            }));
        },
    });

    // Transform applied to the style of the component
    const dragTransform = transform ?? { x: 0, y: 0 };

    // Style of the draggable component
    const style: CSSProperties = {
        transform: CSS.Translate.toString({
            scaleX: 1, scaleY: 1,
            x: position.x + dragTransform.x,
            y: position.y + dragTransform.y
        }),
    };

    return (
        <Paper ref={setNodeRef}
               style={style}
               {...listeners}
               {...attributes}
               elevation={4}
               sx={{
                   bgColor: "primary.main",
                   position: "absolute",
                   top: 16,
                   left: 16,
                   zIndex: 10,
                   maxWidth: 400,
                   pointerEvents: "auto",
               }}
        >
            {title && (
                <Box sx={{ px: 2, py: 1.5, cursor: "move" }}>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Box>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>

        </Paper>
    );
};