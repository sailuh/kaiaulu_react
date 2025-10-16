import { AppProvider} from "./provider.tsx";
import { AppRouter } from './router.tsx';

export const App = ()=> {
  return (
    <>
        <AppProvider>
            <AppRouter/>
        </AppProvider>
    </>
  )
}
