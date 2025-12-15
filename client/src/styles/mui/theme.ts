import { createTheme } from '@mui/material/styles';
import '@fontsource/roboto/300.css';

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
