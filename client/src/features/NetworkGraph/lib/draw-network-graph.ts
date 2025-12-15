import type { Link, Node } from "@/features/NetworkGraph/types/network-graph.types.ts";
import { isNullOrUndefined } from "@/utils/type-guards.ts";
import type {Dispatch, SetStateAction} from "react";

export function drawGraph(
    canvas: HTMLCanvasElement,
    nodes: Node[],
    links: Link[],
    transparentNodeMap: Map<string, number>,
    nodeRadiusMultiplier: number,
    linkColor: string,
    nodeOutlineColor: string,)
{
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = linkColor;
    context.fillStyle = linkColor;

    links.forEach((link) => {
        const s = link.source;
        const t = link.target;

        if (isNullOrUndefined(s.x) && isNullOrUndefined(s.y)) return;

        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        const ux = dx / len;
        const uy = dy / len;

        const rSource = s.value * nodeRadiusMultiplier;
        const rTarget = t.value * nodeRadiusMultiplier;
        const headLength = 10;

        const fromX = s.x + ux * rSource;
        const fromY = s.y + uy * rSource;
        const toX = t.x - ux * (rTarget + headLength * 0.5);
        const toY = t.y - uy * (rTarget + headLength * 0.5);

        drawArrow(context, fromX, fromY, toX, toY, headLength);
    });

    nodes.forEach((node) => {
        drawNodeByGroup(node, context, transparentNodeMap, nodeRadiusMultiplier, nodeOutlineColor);
    })

}

/**
 *  Helper function for drawing nodes
 */
function drawNodeByGroup(
    node: Node,
    context: CanvasRenderingContext2D,
    transparentNodeMap: Map<string, number>,
    nodeRadiusMultiplier: number,
    nodeOutlineColor: string) {

    switch (node.group) {
        case "people":
            context.fillStyle = 'black';
            break;
        case "mail":
            context.fillStyle = '#add8e6';
            break;
        case 'file':
            context.fillStyle = '#fafad2';
            break;
        case 'issue':
            context.fillStyle = '#0052cc';
    }


    const label = node.id;
    if (!label) return;

    // Draws the node
    context.save();
    if (transparentNodeMap.get(node.id) == 1) {
        context.globalAlpha = 0.2;
    }

    context.beginPath();
    context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
    context.fill();

    // Outline
    context.lineWidth = 1;
    context.strokeStyle = nodeOutlineColor;
    context.stroke();

    // Set text attributes
    const px = Math.round(Math.max(10, Math.min(24, node.value * nodeRadiusMultiplier * 0.6)));
    context.font = `${px}px Roboto, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = 'black';

    // If the node is of group people, then set text color to white (to contrast the black node)
    if (node.group === 'people') {
        context.fillStyle = 'white';
    }

    // Draws the text
    context.fillText(label, node.x, node.y);
    context.restore();
}

function drawArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    headLength = 10
) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

/**
 * Helper function for highlighting subgraph
 */
export function highlightSubgraph(
    hitNodeId: string,
    transparentNodeMap: Map<Node["id"], number>,
    nodeRelationshipMap: Map<Node["id"], Set<Node["id"]>>,
    setOverlayOn: Dispatch<SetStateAction<boolean>>,
){

    const current = transparentNodeMap.get(hitNodeId) ?? 0;

    // Are we currently in "normal" mode? (everything opaque)
    const allOpaque = Array.from(transparentNodeMap.values()).every(v => v === 0);

    const highlightNeighborhood = () => {
        // fade everything
        for (const key of transparentNodeMap.keys()) {
            transparentNodeMap.set(key, 1);
        }

        // make hit node + its related nodes opaque
        const relatedNodeSet = nodeRelationshipMap.get(hitNodeId);
        transparentNodeMap.set(hitNodeId, 0);
        relatedNodeSet?.forEach(nodeId => {
            transparentNodeMap.set(nodeId, 0);
        });

        setOverlayOn(true);
    };

    const clearAll = () => {
        for (const key of transparentNodeMap.keys()) {
            transparentNodeMap.set(key, 0);
        }
    };

    if (allOpaque) {
        // First time: go into "highlight" mode
        highlightNeighborhood();
        return;
    }

    // We're already in highlight mode (some nodes have value 1)

    if (current === 0) {
        // Clicked *inside* the highlighted group → reset to fully opaque
        clearAll();
        setOverlayOn(false);
    } else {
        // Clicked on a faded node → switch highlight to this node's group instead
        highlightNeighborhood();
    }
}


export function buildInitialTransparencyMap(nodes: Node[]) {
    const map = new Map<Node["id"], number>();
    nodes.forEach(n => map.set(n.id, 0));
    return map;
}

export function buildRelationshipMap(nodes: Node[], links: Link[]) {
    const map = new Map<Node["id"], Set<Node["id"]>>();

    nodes.forEach((node) => {
        const set = new Set<Node["id"]>();

        links.forEach((link) => {
            const sourceId = link.source.id;
            const targetId = link.target.id;

            if (sourceId === node.id) set.add(targetId);
            else if (targetId === node.id) set.add(sourceId);
        });

        map.set(node.id, set);
    });

    return map;
}