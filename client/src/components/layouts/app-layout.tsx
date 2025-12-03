import { Outlet } from "react-router-dom";
import { Header } from "../ui/header";
import "./app-layout.css";

const AppLayout = () => {
    return (
        <div id={"appContainer"}>
            <Header />
            <Outlet />
        </div>
    )
}

export default AppLayout;