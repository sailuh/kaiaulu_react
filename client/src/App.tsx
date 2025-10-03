import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import './App.css'
import AppLayout from "./layout/AppLayout.tsx";

const Landing = lazy(() => import("./pages/Landing"));

function App() {

  return (
    <>
        <Suspense>
            <Routes>
                <Route element={<AppLayout/>}>
                    <Route index element={<Landing/>} />
                </Route>
            </Routes>
        </Suspense>
    </>
  )
}

export default App
