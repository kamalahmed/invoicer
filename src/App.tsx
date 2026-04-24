import { useStore } from './store';
import { Toolbar } from './components/Toolbar';
import { Editor } from './pages/Editor';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  const view = useStore((s) => s.view);

  return (
    <div
      className={`flex min-h-screen flex-col ${view === 'editor' ? 'sm:h-screen' : ''}`}
    >
      <Toolbar />
      {view === 'dashboard' ? <Dashboard /> : <Editor />}
    </div>
  );
}
