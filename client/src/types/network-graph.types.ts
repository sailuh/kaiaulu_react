import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface Node extends SimulationNodeDatum {
    id: string;
    x: number;
    y: number;
    group: Group;   // added property
    value: number;  // added property
}

export interface Link extends SimulationLinkDatum<Node> {
    source: Node;
    target: Node;
    value: number;
}

export type NetworkGraphData = {
    nodes: Node[];
    links: Link[];
};

export type Group = 'people' | 'mail' | 'file' | 'issue';


export type HubLink = {
    source: Node; target: Node
};

export type NodeRelationshipMap = Map<string, Set<string>>;

export type TransparentNodeMap = Map<string, number>;