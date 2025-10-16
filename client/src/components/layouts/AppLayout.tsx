import { Outlet } from "react-router-dom";
import { Header } from "../ui/Header";
import "./AppLayout.css";

const AppLayout = () => {
    return (
        <div id={"appContainer"}>
            <Header />
            <Outlet />
        </div>
    )
}

export default AppLayout;