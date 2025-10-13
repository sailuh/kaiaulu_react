import { NetworkGraph} from "../components/NetworkGraph";
import { data } from "../data/dummy-data.ts";

const Landing = () => {
    return (
            <NetworkGraph data={data}/>
    )
}

export default Landing;