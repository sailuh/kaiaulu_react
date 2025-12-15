import { alpha, InputBase, styled } from "@mui/material";
import { useNetworkGraph } from "@/features/NetworkGraph/stores/network-graph-context.tsx";
import { useState, type FormEvent } from "react";
import {
    setAllNodesToBeTransparent,
    setNodeNeighborhoodToBeOpaque
} from "@/features/NetworkGraph/utils/transparent-node-map.ts";


const Search = styled("form")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
    },
    paddingLeft: 10,
}));


export const NetworkGraphSearchBar = () => {
    const { nodeRelationshipMapRef, transparentNodeMapRef, overlayOn, setOverlayOn } = useNetworkGraph();

    const [searchInput, setSearchInput] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = searchInput.trim();
        if (!query) return;

        if (!overlayOn) {
            setAllNodesToBeTransparent(transparentNodeMapRef.current);
            setNodeNeighborhoodToBeOpaque(query, transparentNodeMapRef.current, nodeRelationshipMapRef.current);
            setOverlayOn(true);
        }

    };

    return (
        <Search onSubmit={handleSubmit}>
            <InputBase
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                sx={{
                    color: 'white',
                }}>
            </InputBase>
        </Search>
    );
}