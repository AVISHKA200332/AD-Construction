import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import Home from "./Components/Home/Home";
import Foot from "./Components/Footer/Footer";
import FinanceDetails from "./Components/FinanceDetails/FinanceDetails";
import AddFinance from "./Components/AddFinance/AddFinance";
import UpdateFinance from "./Components/UpdateFinance/UpdateFinance";
import FinanceDashboard from "./Components/FinanceDashboard/FinanceDashboard";
import PaymentUpload from "./Components/PaymentUpload/PaymentUpload";

function App() {
  return (
    <Router>
      <Nav /> {/* Navbar stays on all pages */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/finance" element={<FinanceDetails />} />
        <Route path="/dashboard" element={<FinanceDashboard />} />
        <Route path="/addFinance" element={<AddFinance />} />
        <Route path="/updateFinance/:id" element={<UpdateFinance />} />
        <Route path="/payment-upload" element={<PaymentUpload />} />
      </Routes>

      <Foot /> {/* Footer stays on all pages */}
    </Router>
  );
}

export default App;