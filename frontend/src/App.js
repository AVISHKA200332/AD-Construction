import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import Home from "./Components/Home/Home";
import Foot from "./Components/Footer/Footer";
import Project from "./Components/Project/Project";

function App() {
  return (
    <Router>
      <Nav /> {/* Navbar stays on all pages */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Project />} />
      </Routes>

      <Foot /> {/* Footer stays on all pages */}
    </Router>
  );
}

export default App;