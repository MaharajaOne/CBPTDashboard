import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './components/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import ClientDelivery from './Pages/ClientDelivery';
import MonthDelivery from './Pages/MonthDelivery';
import ClientOntime from './Pages/ClientOntime';
import MonthOntime from './Pages/MonthOntime';
import Quality from './Pages/Quality'; // Import Quality component
import TitleStatistics from './Pages/TitleStatistics';
import PerformanceReport from './Pages/PerformanceReport';
import EmployeeList from './Pages/EmployeeList';
import EmployeeDistribution from './Pages/EmployeeDistribution';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [empDetails, setEmpDetails] = useState(null); // State to store employee details
  const [sidebar, setSidebar] = useState([]);
  const navigate = useNavigate();

  const fetchSidebar = (role) => {
    const sidebarOptions = {
      admin: ['Home', 'CBPT Employee List', 'CBPT Employee Distribution', 'CBPT Performance Report', 'Title Statistics', "Producitivity", 'Monthly Report',],
      user: ['Home', 'CBPT Performance Report'],
    };
    setSidebar(sidebarOptions[role] || []);
  };

  useEffect(() => {
    if (token) {
      fetchEmployeeDetails();
    }
  }, [token]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employee-details', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Employee Details:', response.data); // Debugging
      const { name, role, emp_id } = response.data;
      setEmpDetails({ name, role, emp_id }); // Set employee details
      fetchSidebar(role);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
    }
  };

  const handleLogin = async (emp_id, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { emp_id, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setEmpDetails(null);
    setSidebar([]);
    navigate('/');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar empName={empDetails?.name || 'Loading....'} onLogout={handleLogout} />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/home" element={<h1>Home</h1>} />
            <Route path="/cbptperformancereport" element={<PerformanceReport />} />
            <Route path="/monthlyreport/clientdelivery" element={<ClientDelivery />} />
            <Route path="/monthlyreport/monthdelivery" element={<MonthDelivery />} />
            <Route path="/monthlyreport/clientontime" element={<ClientOntime />} />
            <Route path="/monthlyreport/monthontime" element={<MonthOntime />} />
            <Route path="/monthlyreport/quality" element={<Quality />} />
            <Route path="/productivity/employeedailyproductivity" element={<ClientDelivery />} />
            <Route path="/productivity/projectdailyproductivity" element={<MonthDelivery />} />
            <Route path="/productivity/employeemonthlyproductivity" element={<ClientOntime />} />
            <Route path="/productivity/projectmonthlyproductivity" element={<MonthOntime />} />
            <Route path="/cbptemployeelist" element={<EmployeeList />} />
            <Route path="/cbptemployeedistribution" element={<EmployeeDistribution />} />
            <Route path="/titlestatistics" element={<TitleStatistics />} />
            <Route path="/" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
