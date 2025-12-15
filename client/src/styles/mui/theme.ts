import { createTheme } from '@mui/material/styles';
import '@fontsource/roboto/300.css';

/**
 * Custom MUI theme that follows the color scheme of the control panel show in Carlos' UAMC_summer25_auna.pdf
 */
export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2c2c2c',
        },
        secondary: {
            main: '#3c3c3c',
        },
        background: {
            default: '#444444',
        },
    },
    components: {
    },
});
