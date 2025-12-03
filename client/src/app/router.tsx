import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { paths } from '../config/paths.ts';
import AppLayout from "../components/layouts/app-layout.tsx";


const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: paths.home.path,
                lazy: async () => {
                    const { default: Component } = await import("./routes/landing");
                    return { Component };
                },
            },
        ],
    },
]);

export const AppRouter = () => {

    return <RouterProvider router={router} />;
};