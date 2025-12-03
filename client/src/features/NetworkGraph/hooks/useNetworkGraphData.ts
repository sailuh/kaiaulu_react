import { useEffect, useState } from 'react';
import { BASE_PATH } from "@/features/NetworkGraph/config/paths.ts";

import type { NetworkGraphData } from "@/types/network-graph.types.ts";

const GRAPH_FILES = ['file-graph-data.json', 'issue-graph-data.json', 'mail-graph-data.json', 'person-graph-data.json'];

type NetworkGraphJsonData = {[filename: string]: NetworkGraphData};

/**
 *  Loads all network graph data for project specified in user.config.yaml
 */
export function useNetworkGraphData(){
    const [graphData, setGraphData] = useState<NetworkGraphData>({ nodes: [], links: [] });

    useEffect(() => {
        async function load() {
            const jsonData: NetworkGraphJsonData = await readAllJsonsFromDirectory(BASE_PATH);

            // Initialize an empty NetworkGraphData object
            const compiledGraphData : NetworkGraphData = { nodes: [], links: [] };

            // For each file, extract the nodes
            for (const value of Object.values(jsonData)) {
                compiledGraphData.nodes.push(... value.nodes);
                compiledGraphData.links.push(... value.links);
            }

            setGraphData(compiledGraphData);
        }

        load();
    }, []);

    return graphData;
}

/**
 * Loads all .json files from project specified in user.config.yaml
 */
async function readAllJsonsFromDirectory(filePath: string): Promise<NetworkGraphJsonData> {
    const entries = await Promise.all(
        GRAPH_FILES.map(async (fileName) => {
            const res = await fetch(filePath + '/' + fileName);

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

