import { NetworkGraph} from "../components/NetworkGraph";
import { data } from "../data/dummy-data.ts";

const Landing = () => {
    return (
        <div>
            <NetworkGraph data={data}/>
        </div>
    )
}

export default Landing;