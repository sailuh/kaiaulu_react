import { parse } from 'yaml';
import rawConfig from './user.config.yaml?raw';

const config = parse(rawConfig) as {
    networkGraph: {
        projectsDirectory: string,
        targetProject: string;
    };
};

export const TARGET_PROJECT = config.networkGraph.targetProject;

export const PROJECTS_DIRECTORY = config.networkGraph.projectsDirectory;