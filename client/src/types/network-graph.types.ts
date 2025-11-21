import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface Node extends SimulationNodeDatum {
    id: string;
    group: Group;   // added property
    value: number;  // added property
}

export type Link = SimulationLinkDatum<Node> & {
    source: string;
    target: string;
    value: number;  // added property
};

export type NetworkGraphData = {
    nodes: Node[];
    links: Link[];
};

export type Group = 'people' | 'mail' | 'file' | 'issue';

export type NetworkGraphProps = {
    data: NetworkGraphData;
};

export type HubLink = {
    source: Node; target: Node
};