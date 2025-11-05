import type { NetworkGraphData } from "../types/network-graph.types.ts";

export const personDummyData = {
    nodes: [
        {id: 'person_1', group: 'people', value: 2},
        {id: 'person_2', group: 'people', value: 2},
        {id: 'person_3', group: 'people', value: 2},
        {id: 'person_4', group: 'people', value: 2},
    ],
    links: [
        {source: 'person_1', target: 'mail_4', value: 1},
        {source: 'person_1', target: 'file_2', value: 1},
        {source: 'person_2', target: 'file_5', value: 1},
        {source: 'person_2', target: 'mail_2', value: 1},
        {source: 'person_3', target: 'mail_1', value: 1},
        {source: 'person_3', target: 'issue_1', value: 1},
        {source: 'person_4', target: 'file_7', value: 1},
        {source: 'person_4', target: 'file_23', value: 1}
    ],
} as NetworkGraphData;