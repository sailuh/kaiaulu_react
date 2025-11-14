import { NetworkGraphProvider } from "../../features/NetworkGraph/NetworkGraphProvider.tsx";
import { NetworkGraph } from "../../features/NetworkGraph/NetworkGraph.tsx";
import { NetworkGraphToolbar } from "../../features/NetworkGraph/NetworkGraphToolbar.tsx";

const Landing = () => {
    return (
        <>
            <NetworkGraphProvider>
                <NetworkGraphToolbar/>
                <NetworkGraph/>
            </NetworkGraphProvider>
        </>
    )
}

export default Landing;