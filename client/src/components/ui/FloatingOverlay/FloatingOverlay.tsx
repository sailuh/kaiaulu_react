import Paper from "@mui/material/Paper";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDndMonitor } from '@dnd-kit/core';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {useState} from "react";

type FloatingPanelProps = {
    id: string;
    title?: React.ReactNode;
    children?: React.ReactNode;
};

export const FloatingPanel: React.FC<FloatingPanelProps> = ({ title, children, id }) => {
    const [position, setPosition] = useState({ x: 16, y: 16 });

    const {attributes, listeners, setNodeRef, transform } = useDraggable({ id });


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

    const dragTransform = transform ?? { x: 0, y: 0 };

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString({
            scaleX: 1, scaleY: 1,
            x: position.x + dragTransform.x,
            y: position.y + dragTransform.y
        }),
    };

    return (
            <Paper ref={setNodeRef} style={style} {...listeners} {...attributes}
                elevation={4}
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 10,
                    maxWidth: 400,
                    pointerEvents: "auto",
                }}
            >
                {title && (
                    <DialogTitle
                        id="floating-panel-title"
                        sx={{ cursor: "move" }}
                    >
                        {title}
                    </DialogTitle>
                )}
                <DialogContent>{children}</DialogContent>
            </Paper>

    );
};