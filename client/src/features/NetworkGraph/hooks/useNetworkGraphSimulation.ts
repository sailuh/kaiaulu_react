import { useEffect, type RefObject } from "react";
import { forceSimulation, forceLink, forceX, forceY, forceCollide, forceManyBody } from "d3";
import type { Simulation } from "d3";
import type { Node, Link, HubLink } from "@/types/network-graph.types.ts"
import { nodeGroupCenters, buildHubs, buildHubLinks, clearForces } from "@/features/NetworkGraph/lib/network-graph-utils.ts";

interface UseNetworkGraphSimulationArgs {
    nodes: Node[];
    links: Link[];
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function useNetworkGraphSimulation({ nodes, links, canvasRef }: UseNetworkGraphSimulationArgs) {
    useEffect(() => {
        if (!canvasRef.current) return;
        if (!nodes.length || !links.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const forceStrength = -100;
        const nodeRadiusMultiplier = 11;
        const nodePadding = 6;

        const c = nodeGroupCenters(canvas.width, canvas.height);
        const hubs = buildHubs(nodes);
        const hubLinks: HubLink[] = buildHubLinks(nodes, hubs);

        const sim = forceSimulation(nodes)
            .force("link", forceLink<Node, Link>(links).id(d => d.id).distance(80).strength(0.05))
            .force("hubLinks", forceLink<Node, HubLink>(hubLinks).distance(40).strength(0.2))
            .force("x", forceX<Node>(d => c[d.group][0]).strength(0.2))
            .force("y", forceY<Node>(d => c[d.group][1]).strength(0.2))
            .force("collide", forceCollide<Node>().radius(d => d.value * nodeRadiusMultiplier + nodePadding))
            .force("charge", forceManyBody().strength(forceStrength));

        sim.alpha(1);
        for (let i = 0; i < 300; i++) sim.tick();
        clearForces(sim as Simulation<Node, Link>);
        sim.stop();

        return () => {
            clearForces(sim as Simulation<Node, Link>);
            sim.stop();
        };
    }, [nodes, links, canvasRef]);
}
