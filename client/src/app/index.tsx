import { AppProvider} from "./provider.tsx";
import { AppRouter } from './router.tsx';
import './index.css';

export const App = ()=> {
  return (
    <>
        <AppProvider>
            <AppRouter/>
        </AppProvider>
    </>
  )
}
