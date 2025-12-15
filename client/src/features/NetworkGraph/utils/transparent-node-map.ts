/**
 *  THIS FILE CONTAINS HELPER FUNCTIONS FOR MANIPULATING THE TRANSPARENT NODE MAP.
 */




/**
 * Helper function that sets a target node and its related nodes transparency values to be opaque
 */
export function setNodeNeighborhoodToBeOpaque(hitNodeId: string,
                                              transparentNodeMap: Map<string, number>,
                                              nodeRelationshipMap: Map<string, Set<string>>) {

    // make hit node + its related nodes opaque
    const relatedNodeSet = nodeRelationshipMap.get(hitNodeId);

    transparentNodeMap.set(hitNodeId, 0);

    relatedNodeSet?.forEach(nodeId => {
        transparentNodeMap.set(nodeId, 0);
    });

}

/**
 * Helper function that sets all node transparency values to be transparent
 */
export function setAllNodesToBeTransparent(transparentNodeMap: Map<string, number>) {
    for (const key of transparentNodeMap.keys()) {
        transparentNodeMap.set(key, 1);
    }
}

/**
 * Helper function that sets all node transparency values to be opaque
 */
export function setAllNodesToBeOpaque(transparentNodeMap: Map<string, number>) {
    for (const key of transparentNodeMap.keys()) {
        transparentNodeMap.set(key, 0);
    }
}