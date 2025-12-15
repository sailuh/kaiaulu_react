import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

/**
 *  Provides current layout for the application. Renders the header above any child components passed to it.
 */
const AppLayout = () => {
    return (
        <Box
            sx={{
                height: '100vh',            // exactly viewport height
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            <Box
                component="main"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}

export default AppLayout;