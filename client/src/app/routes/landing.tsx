import { NetworkGraphProvider } from "@/features/NetworkGraph/stores/network-graph-context.tsx";
import { NetworkGraph } from "@/features/NetworkGraph";
import { NetworkGraphToolbar } from "@/features/NetworkGraph/components/network-graph-toolbar.tsx";

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