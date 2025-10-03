import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface Node extends SimulationNodeDatum {
    id: string;
}

export type Link = SimulationLinkDatum<Node> & {
    value: number;
};

export type NetworkGraphData = {
    nodes: Node[];
    links: Link[];
};