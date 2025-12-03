import { Suspense, type ReactNode } from 'react';

type AppProviderProps = {
    children: ReactNode;
};


/**
 *  Provider for entire application.
*/
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <Suspense>
                {children}
        </Suspense>
    );
}