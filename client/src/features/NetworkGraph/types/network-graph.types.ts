import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

/**
 *  Extended D3.js node object interface from D3.js.
 */

export interface Node extends SimulationNodeDatum {
    id: string;
    x: number;
    y: number;
    group: Group;   // added property
    value: number;  // added property
}

/**
 *  Extended D3.js link object interface from D3.js.
 */

export interface Link extends SimulationLinkDatum<Node> {
    source: Node;
    target: Node;
    value: number;
}

type Group = 'people' | 'mail' | 'file' | 'issue';
