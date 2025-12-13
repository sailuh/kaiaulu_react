import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import logo from '@/assets/kaiaulu_logo.png';
import { Typography } from "@mui/material";
import { NetworkGraphSearchBar } from "@/features/NetworkGraph/components/network-graph-search-bar.tsx";

export const Navbar = () => {


    return (
            <AppBar position="static">
                <Toolbar sx={{ bgcolor: 'primary.main' }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="My App Logo"
                            sx={{ height: 50, width: 'auto' }}
                        />
                    </IconButton>

                    <Typography
                        sx={{
                            flexGrow: 1,
                            color: 'white',
                            fontFamily: 'monospace',
                            fontSize: '1.25rem',
                        }}
                    >
                        Projects
                    </Typography>

                    <NetworkGraphSearchBar/>
                </Toolbar>
            </AppBar>
    )
}