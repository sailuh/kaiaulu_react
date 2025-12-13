import { NetworkGraphProvider } from "@/features/NetworkGraph/stores/network-graph-context.tsx";
import { NetworkGraphCanvas } from "@/features/NetworkGraph";
import { Navbar } from "@/components/ui/navbar/navbar.tsx";
import Box from "@mui/material/Box";

/**
 *  Landing page component.
 *
 *  Holds the Network Graph feature currently.
 */
const Landing = () => {
    return (
        <NetworkGraphProvider>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Navbar />

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                    }}
                >
                    <NetworkGraphCanvas />
                </Box>
            </Box>
        </NetworkGraphProvider>
    )
}

export default Landing;