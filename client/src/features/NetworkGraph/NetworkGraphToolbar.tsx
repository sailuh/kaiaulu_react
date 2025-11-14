import "./NetworkGraphToolbar.css";
import { useNetworkGraph } from "./NetworkGraphProvider.tsx";

export const NetworkGraphToolbar = () => {
    const { loadFromFiles } = useNetworkGraph();

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        if (!e.target.files) return;
        await loadFromFiles(e.target.files);
    }

    return (
        <div id={"networkGraphToolbar"}>
            <input type={'file'} multiple onChange={handleChange}/>
        </div>
    )
};