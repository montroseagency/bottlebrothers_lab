
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/header';
import { Footer } from './components/layout/Footer';
import Home from "./pages/Home";
import Menu from './pages/Menu';
import Events from './pages/Events';
// import Gallery from './pages/Gallery'; // Not implemented yet
import ContactUs from './pages/ContactUs';


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <Header />
        
        {/* Main content area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/events" element={<Events />} />
            {/* <Route path="/gallery" element={<Gallery />} /> */}
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

