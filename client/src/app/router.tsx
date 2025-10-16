import { QueryClient, useQueryClient } from '@tanstack/react-query';
import {createBrowserRouter, RouterProvider } from "react-router-dom";
import { paths } from '../config/paths.ts';
import { useMemo } from "react";

const convert = (queryClient: QueryClient) => (m: any) => {
    const { clientLoader, clientAction, default: Component, ...rest } = m;
    return {
        ...rest,
        loader: clientLoader?.(queryClient),
        action: clientAction?.(queryClient),
        Component,
    };
};

export const createAppRouter = (queryClient: QueryClient) =>
    createBrowserRouter([
        {
            path: paths.home.path,
            lazy: () => import('./routes/landing').then(convert(queryClient)),
        }
    ]);

export const AppRouter = () => {
    const queryClient = useQueryClient();

    const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

    return <RouterProvider router={router} />;
};