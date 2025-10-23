import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from './home';
import { ImageView } from './imageView';
import { BoardList } from './boardlist';
import { BoardView } from './boardview';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/img/:image_id" element={<ImageView />} />
        <Route path="/boards" element={<BoardList />} />
        <Route path="/b/:board_id" element={<BoardView />} />
      </Routes>
    </Router>
  );
}

export default App;