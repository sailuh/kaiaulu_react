import { Outlet } from "react-router-dom";
import { Header } from "../ui/header";
import "./app-layout.css";

/**
 *  Provides current layout for the application. Renders the header above any child components passed to it.
 */
const AppLayout = () => {
    return (
        <div id={"appContainer"}>
            <Header />
            <Outlet />
        </div>
    )
}

export default AppLayout;