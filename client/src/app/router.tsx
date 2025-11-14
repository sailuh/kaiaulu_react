import { QueryClient, useQueryClient } from '@tanstack/react-query';
import {createBrowserRouter, RouterProvider } from "react-router-dom";
import { paths } from '../config/paths.ts';
import { useMemo } from "react";
import AppLayout from "../components/layouts/AppLayout.tsx";

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
            // Layout route
            element: <AppLayout />,
            children: [
                {
                    path: paths.home.path,
                    lazy: () => import('./routes/landing').then(convert(queryClient)),
                },
                // add more child routes here later
            ],
        },
    ]);

export const AppRouter = () => {
    const queryClient = useQueryClient();

    const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

    return <RouterProvider router={router} />;
};