import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PollPage from './pages/PollPage';
import UserPolls from './pages/UserPolls';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="user/polls" element={<UserPolls />} />
          <Route path="polls/:pollId" element={<PollPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}