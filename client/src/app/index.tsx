import { AppProvider} from "./provider.tsx";
import { AppRouter } from './router.tsx';
import './index.css';

/**
 *  Root of the app
 */

export const App = ()=> {
  return (
    <>
        <AppProvider>
            <AppRouter/>
        </AppProvider>
    </>
  )
}
