import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import Foot from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import SignIn from "./Components/Auth/SignIn";
import SignUp from "./Components/Auth/SignUp";
import ClientDashboard from "./Components/Client/ClientDashboard";
import ClientProjects from "./Components/Client/ClientProjects";
import ClientFinancial from "./Components/Client/ClientFinancial";
import ClientReports from "./Components/Client/ClientReports";
import ClientSettings from "./Components/Client/ClientSettings";
import ClientCommunication from "./Components/Client/ClientCommunication";
import ClientInventory from "./Components/Client/ClientInventory";
import ApplyJob from "./Components/Apply/ApplyJob";
import AdminUsers from "./Components/Admin/AdminUsers";
import AdminProjects from "./Components/Admin/AdminProjects";
import AdminFinancial from "./Components/Admin/AdminFinancial";
import AdminReports from "./Components/Admin/AdminReports";
import AdminSettings from "./Components/Admin/AdminSettings";
import AdminCommunication from "./Components/Admin/AdminCommunication";
import SMDashboard from "./Components/SiteManager/SMDashboard";
import SMProjects from "./Components/SiteManager/SMProjects";
import SMFinancial from "./Components/SiteManager/SMFinancial";
import SMSettings from "./Components/SiteManager/SMSettings";
import SMCommunication from "./Components/SiteManager/SMCommunication";
import SMInventory from "./Components/SiteManager/SMInventory";
import SupDashboard from "./Components/Supervisor/SupDashboard";
import SupFinancial from "./Components/Supervisor/SupFinancial";
import SupProjects from "./Components/Supervisor/SupProjects";
import SupReports from "./Components/Supervisor/SupReports";
import SupSettings from "./Components/Supervisor/SupSettings";
import SupCommunication from "./Components/Supervisor/SupCommunication";
import SupInventory from "./Components/Supervisor/SupInventory";
import LaborDashboard from "./Components/Labor/LaborDashboard.js";
import LaborProjects from "./Components/Labor/LaborProjects";
import LaborReports from "./Components/Labor/LaborReports";
import LaborSettings from "./Components/Labor/LaborSettings";
import LaborCommunication from "./Components/Labor/LaborCommunication";
import LaborInventory from "./Components/Labor/LaborInventory";
import ClientProfile from "./Components/Profile/ClientProfile";
import AdminProfile from "./Components/Profile/AdminProfile";

function AppContent() {
  const location = useLocation();
  const hideNavOn = ["/", "/signin", "/signup"]; // Hide Nav on public pages
  const showNav = !hideNavOn.includes(location.pathname);
  const hideFootOn = ["/signin", "/signup"]; // Hide Footer on auth pages
  const showFoot = !hideFootOn.includes(location.pathname);

  return (
    <>
      {showNav && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/apply" element={<ApplyJob />} />
        {/* Client Routes */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/projects" element={<ClientProjects />} />
        <Route path="/client/financial" element={<ClientFinancial />} />
        <Route path="/client/reports" element={<ClientReports />} />
        <Route path="/client/settings" element={<ClientSettings />} />
        <Route path="/client/communication" element={<ClientCommunication />} />
        <Route path="/client/inventory" element={<ClientInventory />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/financial" element={<AdminFinancial />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/communication" element={<AdminCommunication />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/site-manager/communication" element={<SMCommunication />} />
        <Route path="/site-manager/inventory" element={<SMInventory />} />
        {/* Supervisor Routes */}
        <Route path="/supervisor/dashboard" element={<SupDashboard />} />
        <Route path="/supervisor/financial" element={<SupFinancial />} />
        <Route path="/supervisor/projects" element={<SupProjects />} />
        <Route path="/supervisor/reports" element={<SupReports />} />
        <Route path="/supervisor/settings" element={<SupSettings />} />
        <Route path="/supervisor/communication" element={<SupCommunication />} />
        <Route path="/supervisor/inventory" element={<SupInventory />} />
        {/* Labor Routes */}
                <Route path="/labor/projects" element={<LaborProjects />} />
        <Route path="/labor/reports" element={<LaborReports />} />
        <Route path="/labor/settings" element={<LaborSettings />} />
        <Route path="/labor/communication" element={<LaborCommunication />} />
        <Route path="/labor/inventory" element={<LaborInventory />} />
      </Routes>
      {showFoot && <Foot />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;