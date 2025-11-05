import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface Node extends SimulationNodeDatum {
    id: string;
    group: Group;
    value: number;
}

export type Link = SimulationLinkDatum<Node> & {
    source: Node;
    target: Node;
    value: number;
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