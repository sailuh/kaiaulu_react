import { useEffect, useState } from 'react';
import { PROJECTS_DIRECTORY, TARGET_PROJECT } from "@/config/app.ts";
import type {NetworkGraphData} from "@/types/network-graph.types.ts";

const GRAPH_FILES = ['file-graph-data.json', 'issue-graph-data.json', 'mail-graph-data.json', 'person-graph-data.json'];

export function useGraphJsonFiles(){
    const [graphData, setGraphData] = useState<NetworkGraphData>({ nodes: [], links: [] });

    useEffect(() => {
        async function load() {
            const result = await readAllJsonsFromDirectory();

            const compiledGraphData : NetworkGraphData = { nodes: [], links: [] };

            for (const value of Object.values(result)) {
                compiledGraphData.nodes.push(... value.nodes);
                compiledGraphData.links.push(... value.links);
            }

            setGraphData(compiledGraphData);
        }
        load();
    }, []);

    return graphData;
}

async function readAllJsonsFromDirectory() {
    const BASE_PATH = `/${PROJECTS_DIRECTORY}/${TARGET_PROJECT}`;

    const entries = await Promise.all(
        GRAPH_FILES.map(async (fileName) => {
            const res = await fetch(`${BASE_PATH}/${fileName}`);

            if (!res.ok) {
                throw new Error(`Failed to load ${fileName}: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();
            return [fileName, json] as const;
        }),
    );

    // object keyed by file name:
    return Object.fromEntries(entries);
}