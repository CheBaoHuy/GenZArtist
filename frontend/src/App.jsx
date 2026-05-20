import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameInfo from './pages/GameInfo';
import Blog from './pages/Blog';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/blog/:id" element={<Home />} />

          <Route path="/game-info" element={<GameInfo />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/add-blog" element={<Blog />} />
          <Route path="/blogs/:id" element={<Blog />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;