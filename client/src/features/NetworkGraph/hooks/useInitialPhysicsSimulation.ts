import { useEffect } from "react";
import { forceSimulation, forceLink, forceX, forceY, forceCollide, forceManyBody } from "d3";
import type { Simulation } from "d3";
import type { Node, Link, HubLink, Group } from "@/features/NetworkGraph/types/network-graph.types.ts"
import {useNetworkGraph} from "@/features/NetworkGraph/stores/network-graph-context.tsx";

type NodeGroupCenters = {
    people: [number, number];
    mail: [number, number];
    file: [number, number];
    issue: [number, number];
}

/**
 *  Runs physics simulation to determine initial position of nodes and links in the Network Graph.
 *  Accepts a function as a parameter which it will execute once the simulation finishes.
 *  Mutates node and link objects to have x and y coordinates, sets them according to simulation results.
 *
 *  Note:
 *  - D3.js force simulation is used to calculate the positions of all nodes and links
 *  - Nodes and link objects are mutated by D3.js force simulation to contain position values x and y
 *
 *  Usage:
 *  - Call it in a NetworkGraphCanvas component
 */
export function useInitialPhysicsSimulation(renderNetworkGraph: () => void) {

    const {
        nodes,
        links,
        canvasRef
    } = useNetworkGraph();

    useEffect(() => {
        if (!canvasRef.current) return;
        if (!nodes.length || !links.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Strength of node gravity
        const forceStrength = -100;

        // Arbitrary scalar that changes the size of the nodes, 11 seemed to be the nicest
        const nodeRadiusMultiplier = 11;

        // Padding between nodes (so they don't cling tightly to each other and instead are separated by a small amount of space)
        const nodePadding = 6;

        // Calculates the positions of the hubs, the hub is the center of a network, each node type has one hub which the other nodes are gravitated to
        const c = calculateNodeGroupCenters(canvas.width, canvas.height);

        // Decides which node in each type network will be the hub of its network.
        const hubs = buildHubs(nodes);

        // Create links for the physics simulation between hub nodes and their surrounding nodes
        const hubLinks: HubLink[] = buildHubLinks(nodes, hubs);

        /**
         *  Creates a D3.js force simulation with the nodes and links provided.
         *
         *  Look into the documentation for D3.js forceSimulation for more detail.
         */
        const sim = forceSimulation(nodes)
            .force("link", forceLink<Node, Link>(links).id(d => d.id).distance(80).strength(0.05))
            .force("hubLinks", forceLink<Node, HubLink>(hubLinks).distance(40).strength(0.2))
            .force("x", forceX<Node>(d => c[d.group][0]).strength(0.2))
            .force("y", forceY<Node>(d => c[d.group][1]).strength(0.2))
            .force("collide", forceCollide<Node>().radius(d => d.value * nodeRadiusMultiplier + nodePadding))
            .force("charge", forceManyBody().strength(forceStrength));

        /**
         * Set the simulation alpha to 1 (this is like the start of the simulation where nothing has happened)
         */
        sim.alpha(1);

        /**
         * Run the simulation for an arbitrary amount of ticks, 300 seemed to be the best.
         */
        for (let i = 0; i < 300; i++) sim.tick();

        /**
         * Zeroes out any remaining forces
         */
        clearForces(sim as Simulation<Node, Link>);

        /**
         * Stops the simulation
         */
        sim.stop();

        // Finally, draw the Network Graph with its updated state
        renderNetworkGraph();

    }, [nodes, links, canvasRef, renderNetworkGraph]);
}

/**
 *  Helper function for calculating node group centers, the values inside are arbitrary, this can be modularized more in the future,
 *  for now there are four node types, and four positions.
 */
function calculateNodeGroupCenters(canvasWidth: number, canvasHeight: number): NodeGroupCenters {
    return {
        people: [canvasWidth * 0.5, canvasHeight * 0.5],
        mail:   [canvasWidth * 0.8, canvasHeight * 0.4],
        file:   [canvasWidth * 0.25, canvasHeight * 0.5],
        issue:  [canvasWidth * 0.8, canvasHeight * 0.6],
    }
}

/**
 * Helper function for determining the hub node for each node network
 */
function buildHubs(nodes: Node[]) {
    const hubs: Partial<Record<Group, Node>> = {};

    for (const n of nodes) {
        const existing = hubs[n.group];
        if (!existing || n.value > existing.value) {
            hubs[n.group] = n;
        }
    }

    return hubs;
}

/**
 * Helper function for creating the links between each hub node and its surrounding nodes (part of the simulation)
 */
function buildHubLinks(nodes: Node[], hubs: Partial<Record<Group, Node>>) {
    return nodes
        .filter(n => hubs[n.group] && !isHub(n, hubs as Record<Group, Node>))
        .map(n => ({ source: hubs[n.group]!, target: n }));
}

/**
 *  Helper function for determining if a node is the hub
 */
function isHub (d: Node, hubs: Record<Group, Node>) {
    return hubs[d.group] === d;
}

/**
 *  Clears all forces used in simulation.
 */
function clearForces(sim: Simulation<Node, Link>) {
    sim
        .force('x', null)
        .force('y', null)
        .force('collide', null)
        .force('charge', null)
        .force('link', null)
        .force('hubLinks', null)
        .velocityDecay(1); // stop inertia
}