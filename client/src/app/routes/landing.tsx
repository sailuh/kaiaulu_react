import { NetworkGraphProvider } from "@/features/NetworkGraph/NetworkGraphContext.tsx";
import { NetworkGraph } from "@/features/NetworkGraph";
import { NetworkGraphToolbar } from "@/features/NetworkGraph/components/NetworkGraphToolbar.tsx";

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