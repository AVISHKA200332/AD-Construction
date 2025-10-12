import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import FinanceDetails from "./Components/Finance/FinanceDetails/FinanceDetails";
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
import ClientServices from "./Components/Client/ClientServices";
import ApplyJob from "./Components/Apply/ApplyJob";
import AdminUsers from "./Components/Admin/AdminUsers";
import AdminProjects from "./Components/Admin/AdminProjects";
import AdminFinancial from "./Components/Admin/AdminFinancial";
import AdminReports from "./Components/Admin/AdminReports";
import AdminSettings from "./Components/Admin/AdminSettings";
import AdminCommunication from "./Components/Admin/AdminCommunication";
import AdminInventory from "./Components/Admin/AdminInventory";
import CartPage from "./Components/Admin/CartPage";
import CheckoutPage from "./Components/Admin/CheckoutPage";
import SMDashboard from "./Components/SiteManager/SMDashboard";
import SMProjects from "./Components/SiteManager/SMProjects";
import SMFinancial from "./Components/SiteManager/SMFinancial";
import SMSettings from "./Components/SiteManager/SMSettings";
import SMCommunication from "./Components/SiteManager/SMCommunication";
import SMInventory from "./Components/SiteManager/SMInventory";
import SMReports from "./Components/SiteManager/SMReports";
import SiteManagerServices from "./Components/SiteManager/SiteManagerServices";
import LaborDashboard from "./Components/Labor/LaborDashboard.js";
import LaborProjects from "./Components/Labor/LaborProjects";
import LaborReports from "./Components/Labor/LaborReports";
import LaborSettings from "./Components/Labor/LaborSettings";
import LaborCommunication from "./Components/Labor/LaborCommunication";
import LaborInventory from "./Components/Labor/LaborInventory";
import PMDashboard from "./Components/PM/PMDashboard";
import PMProjects from "./Components/PM/PMProjects";
import PMAssignSupervisor from "./Components/PM/PMAssignSupervisor";
import PMProgress from "./Components/PM/PMProgress";
import PMReports from "./Components/PM/PMReports";
import PMDocuments from "./Components/PM/PMDocuments";
import SSDashboard from "./Components/SiteSupervisor/SSDashboard";
import SSProjects from "./Components/SiteSupervisor/SSProjects";
import SSFinancial from "./Components/SiteSupervisor/SSFinancial";
import SSReports from "./Components/SiteSupervisor/SSReports";
import SSCommunication from "./Components/SiteSupervisor/SSCommunication";
import SSInventory from "./Components/SiteSupervisor/SSInventory";
import SSSettings from "./Components/SiteSupervisor/SSSettings";
import RequireRole from "./Components/Auth/RequireRole";
// Legacy specialized pages still available (not in nav now)
import SSDailyUpdates from "./Components/SiteSupervisor/SSDailyUpdates";
import SSLaborAssignments from "./Components/SiteSupervisor/SSLaborAssignments";
import SSMaterialRequests from "./Components/SiteSupervisor/SSMaterialRequests";
import SSIssues from "./Components/SiteSupervisor/SSIssues";
import ClientProfile from "./Components/Profile/ClientProfile"; // legacy specific
import AdminProfile from "./Components/Profile/AdminProfile"; // legacy specific
import ProfilePage from "./Components/Profile/ProfilePage"; // new unified
import SettingsPage from "./Components/Profile/SettingsPage";
import UpdateFinance from "./Components/Finance/UpdateFinance/UpdateFinance";
import { CartProvider } from "./Components/Admin/CartContext";
import LaborServices from "./Components/Labor/LaborServices";

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
        <Route path="/client/services" element={<ClientServices />} />
        <Route path="/client/inventory" element={<ClientInventory />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/financial" element={<AdminFinancial />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/communication" element={<AdminCommunication />} />
  <Route path="/admin/inventory" element={<AdminInventory />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Finance Records Route */}
        <Route path="/financeRecords" element={<FinanceDetails />} />
        {/* Update Finance Route */}
        <Route path="/updateFinance/:id" element={<UpdateFinance />} />
        {/* Site Manager Routes */}
        <Route path="/site-manager/dashboard" element={<SMDashboard />} />
        <Route path="/site-manager/projects" element={<SMProjects />} />
        <Route path="/site-manager/financial" element={<SMFinancial />} />
        <Route path="/site-manager/reports" element={<SMReports />} />
        <Route path="/site-manager/settings" element={<SMSettings />} />
        <Route path="/site-manager/communication" element={<SMCommunication />} />
        <Route path="/site-manager/services" element={<SiteManagerServices />} />
        <Route path="/site-manager/inventory" element={<SMInventory />} />
        {/* Labor Routes */}
        <Route path="/pm/dashboard" element={<PMDashboard />} />
        <Route path="/pm/projects" element={<PMProjects />} />
        <Route path="/pm/assign" element={<PMAssignSupervisor />} />
        <Route path="/pm/progress" element={<PMProgress />} />
        <Route path="/pm/reports" element={<PMReports />} />
        <Route path="/pm/documents" element={<PMDocuments />} />
        {/* Site Supervisor (Site Manager style) - restricted to Site Supervisor roles */}
        <Route path="/site-supervisor/dashboard" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSDashboard />
          </RequireRole>
        } />
        <Route path="/site-supervisor/projects" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSProjects />
          </RequireRole>
        } />
        <Route path="/site-supervisor/financial" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSFinancial />
          </RequireRole>
        } />
        <Route path="/site-supervisor/reports" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSReports />
          </RequireRole>
        } />
        <Route path="/site-supervisor/communication" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSCommunication />
          </RequireRole>
        } />
        <Route path="/site-supervisor/inventory" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSInventory />
          </RequireRole>
        } />
        <Route path="/site-supervisor/settings" element={
          <RequireRole allow={["Site Supervisor","Supervisor"]}>
            <SSSettings />
          </RequireRole>
        } />
        {/* Legacy retained endpoints */}
        <Route path="/site-supervisor/daily" element={<SSDailyUpdates />} />
        <Route path="/site-supervisor/labor" element={<SSLaborAssignments />} />
        <Route path="/site-supervisor/material" element={<SSMaterialRequests />} />
        <Route path="/site-supervisor/issues" element={<SSIssues />} />
        <Route path="/labor/dashboard" element={<LaborDashboard />} />
        <Route path="/labor/projects" element={<LaborProjects />} />
        <Route path="/labor/reports" element={<LaborReports />} />
        <Route path="/labor/settings" element={<LaborSettings />} />
        <Route path="/labor/services" element={<LaborServices />} />
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
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;
