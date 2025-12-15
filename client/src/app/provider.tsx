import { Suspense, type ReactNode } from 'react';
import { ThemeProvider } from "@mui/material";
import { theme } from "@/styles/mui/theme.ts";

type AppProviderProps = {
    children: ReactNode;
};


/**
 *  Provider for entire application.
*/
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <Suspense>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </Suspense>
    );
}