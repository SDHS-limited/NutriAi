import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import MealLog from './pages/MealLog';
import Analysis from './pages/Analysis';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export default function App() {
  const { onboardingDone } = useStore();

  if (!onboardingDone) return <Onboarding />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="meal" element={<MealLog />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
