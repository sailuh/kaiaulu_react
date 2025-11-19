import type {Group, Link, Node} from "@/types/network-graph.types.ts";
import {drag, pointer, type Simulation} from "d3";

export const nodeGroupCenters = (w: number, h: number) => ({
    people: [w * 0.5, h * 0.4],
    mail:   [w * 0.8, h * 0.3],
    file:   [w * 0.25, h * 0.4],
    issue:  [w * 0.8, h * 0.6],
});

export function buildInitialTransparencyMap(nodes: Node[]) {
    const map = new Map<Node["id"], number>();
    nodes.forEach(n => map.set(n.id, 0));
    return map;
}

export function updateTransparency(
    hitNode: Node,
    transparentNodeMap: Map<Node["id"], number>,
    nodeRelationshipMap: Map<Node["id"], Set<Node["id"]>>
){
    if (!hasPos(hitNode)) return;

    const isTransparent = transparentNodeMap.get(hitNode.id);

    if (isTransparent === 0) {
        for (const key of transparentNodeMap.keys()) {
            transparentNodeMap.set(key, 1);
        }
        transparentNodeMap.set(hitNode.id, 0);

        const relatedNodeSet = nodeRelationshipMap.get(hitNode.id);
        relatedNodeSet?.forEach(nodeId => {
            transparentNodeMap.set(nodeId, 0);
        });
    }
}

export function buildHubs(nodes: Node[]) {
    const hubs: Partial<Record<Group, Node>> = {};

    for (const n of nodes) {
        const existing = hubs[n.group];
        if (!existing || n.value > existing.value) {
            hubs[n.group] = n;
        }
    }

    return hubs;
}

export function buildHubLinks(nodes: Node[], hubs: Partial<Record<Group, Node>>) {
    return nodes
        .filter(n => hubs[n.group] && !isHub(n, hubs as Record<Group, Node>))
        .map(n => ({ source: hubs[n.group]!, target: n }));
}

function isHub (d: Node, hubs: Record<Group, Node>) {
    return hubs[d.group] === d;
}

export function createDragBehavior(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    nodes: Node[],
    nodeRadiusMultiplier: number,
    links: Link[],
    transparentNodeMap: Map<string, number>) {

    return drag<HTMLCanvasElement, unknown>()
        .subject((event) => {
            const [x, y] = pointer(event, canvas);

            // find nearest node within radius
            const n = findNodeAt(nodes, nodeRadiusMultiplier, x, y);

            if (n) {
                n.fx = n.x ?? x;
                n.fy = n.y ?? y;
            }

            return n;
        })
        .on('drag', (event) => {
            const n = event.subject;
            n.x = event.x;
            n.y = event.y;
            drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
        });
}

export function buildRelationshipMap(nodes: Node[], links: Link[]) {
    const map = new Map<Node["id"], Set<Node["id"]>>();

    nodes.forEach((node) => {
        const set = new Set<Node["id"]>();

        links.forEach((link) => {
            const sourceId = isNode(link.source) ? link.source.id : link.source;
            const targetId = isNode(link.target) ? link.target.id : link.target;

            if (sourceId === node.id) set.add(targetId);
            else if (targetId === node.id) set.add(sourceId);
        });

        map.set(node.id, set);
    });

    return map;
}

const drawNodeByGroup = (
    node: Node,
    context: CanvasRenderingContext2D,
    transparentNodeMap: Map<string, number>,
    nodeRadiusMultiplier: number) => {

    if (!hasPos(node)) return;

    // Sets color of node according to group
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
    context.moveTo(node.x, node.y);
    context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
    context.fill();


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
};

function isNode(v: Link["source"]): v is Node {
    return typeof v === "object" && v !== null;
}

function hasPos(n: Node): n is Node & { x: number; y: number } {
    return n.x != null && n.y != null;
}


export function drawGraph (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    nodes: Node[],
    links: Link[],
    transparentNodeMap: Map<string, number>,
    nodeRadiusMultiplier: number){

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "grey";

    links.forEach((link) => {
        if (!isNode(link.source) || !isNode(link.target)) return;

        const s = link.source;
        const t = link.target;
        if (!hasPos(s) || !hasPos(t)) return;

        context.beginPath();
        context.moveTo(s.x, s.y);
        context.lineTo(t.x, t.y);
        context.stroke();
    });

    nodes.forEach((node) => {
        drawNodeByGroup(node, context, transparentNodeMap, nodeRadiusMultiplier);
    })

}

// Finds the topmost node under (x,y)
export function findNodeAt(nodes: Node[], nodeRadiusMultiplier: number, x: number, y: number) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (!hasPos(n)) continue;

        const r = n.value * nodeRadiusMultiplier;
        const dx = x - n.x!;
        const dy = y - n.y!;

        if (dx*dx + dy*dy <= r*r) return n;
    }
    return undefined;
}

export function clearForces(sim: Simulation<Node, Link>) {
    sim
        .force('x', null)
        .force('y', null)
        .force('collide', null)
        .force('charge', null)
        .force('link', null)
        .force('hubLinks', null)
        .velocityDecay(1); // stop inertia
}