import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Sidebar = () => {
  const [openMonthlyReport, setOpenMonthlyReport] = useState(false);
  const [openProductivity, setOpenProductivity] = useState(false);
  const location = useLocation();

  const toggleMonthlyReportSubmenu = () => {
    setOpenMonthlyReport(!openMonthlyReport);
  };

  const toggleProductivitySubmenu = () => {
    setOpenProductivity(!openProductivity);
  };

  const isActive = (path) => location.pathname.toLowerCase() === path.toLowerCase();

  useEffect(() => {
    const monthlyReportPaths = [
      "/monthlyreport/clientdelivery",
      "/monthlyreport/monthdelivery",
      "/monthlyreport/clientontime",
      "/monthlyreport/monthontime",
      "/monthlyreport/quality"
    ];
    setOpenMonthlyReport(monthlyReportPaths.includes(location.pathname.toLowerCase()));

    const productivityPaths = [
      "/productivity/employeedailyproductivity",
      "/productivity/projectdailyproductivity",
      "/productivity/employeemonthlyproductivity",
      "/productivity/projectmonthlyproductivity"
    ];
    setOpenProductivity(productivityPaths.includes(location.pathname.toLowerCase()));
  }, [location]);

  return (
    <div className="d-flex flex-column flex-shrink-0 bg-light border-end"
      style={{ width: '200px', height: '100vh', paddingTop: '20px' }}
    >
      <Nav variant="pills" className="flex-column mb-auto">

        {/* Home */}
        <Nav.Item>
          <Nav.Link as={Link} to="/home" className={`px-3 py-2 ${isActive('/home') ? 'bg-primary text-white' : 'text-dark'}`}>
            Home
          </Nav.Link>
        </Nav.Item>

        {/* CBPT Employee List */}
        <Nav.Item>
          <Nav.Link as={Link} to="/cbptemployeelist" className={`px-3 py-2 ${isActive('/cbptemployeelist') ? 'bg-primary text-white' : 'text-dark'}`}>
            CBPT Employee List
          </Nav.Link>
        </Nav.Item>

        {/* CBPT Employee Distribution */}
        <Nav.Item>
          <Nav.Link as={Link} to="/cbptemployeedistribution" className={`px-3 py-2 ${isActive('/cbptemployeedistribution') ? 'bg-primary text-white' : 'text-dark'}`}>
            CBPT Employee Distribution
          </Nav.Link>
        </Nav.Item>

        {/* CBPT Performance Report */}
        <Nav.Item>
          <Nav.Link as={Link} to="/cbptperformancereport" className={`px-3 py-2 ${isActive('/cbptperformancereport') ? 'bg-primary text-white' : 'text-dark'}`}>
            CBPT Performance Report
          </Nav.Link>
        </Nav.Item>

        {/* Title Statistics */}
        <Nav.Item>
          <Nav.Link as={Link} to="/titlestatistics" className={`px-3 py-2 ${isActive('/titlestatistics') ? 'bg-primary text-white' : 'text-dark'}`}>
            Title Statistics
          </Nav.Link>
        </Nav.Item>

        {/* Monthly Report - Dropdown */}
        <Nav.Item>
          <Button
            variant="link"
            onClick={toggleMonthlyReportSubmenu}
            aria-controls="monthly-report-collapse"
            aria-expanded={openMonthlyReport}
            className={`text-start px-3 py-2 text-decoration-none ${openMonthlyReport ? 'bg-primary text-white' : 'text-dark'}`}
            style={{
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            Monthly Report {openMonthlyReport ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
          <Collapse in={openMonthlyReport}>
            <div id="monthly-report-collapse">
              <Nav className="flex-column mt-2">
                <Nav.Item>
                  <Nav.Link as={Link} to="/monthlyreport/clientdelivery" className={`px-3 py-2 ${isActive('/monthlyreport/clientdelivery') ? 'bg-primary text-white' : 'text-dark'}`}>Client Delivery</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/monthlyreport/monthdelivery" className={`px-3 py-2 ${isActive('/monthlyreport/monthdelivery') ? 'bg-primary text-white' : 'text-dark'}`}>Month Delivery</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/monthlyreport/clientontime" className={`px-3 py-2 ${isActive('/monthlyreport/clientontime') ? 'bg-primary text-white' : 'text-dark'}`}>Client On-Time</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/monthlyreport/monthontime" className={`px-3 py-2 ${isActive('/monthlyreport/monthontime') ? 'bg-primary text-white' : 'text-dark'}`}>Month On-Time</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/monthlyreport/quality" className={`px-3 py-2 ${isActive('/monthlyreport/quality') ? 'bg-primary text-white' : 'text-dark'}`}>Quality</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </Collapse>
        </Nav.Item>

        {/* Productivity - Dropdown */}
        <Nav.Item>
          <Button
            variant="link"
            onClick={toggleProductivitySubmenu}
            aria-controls="productivity-collapse"
            aria-expanded={openProductivity}
            className={`text-start px-3 py-2 text-decoration-none ${openProductivity ? 'bg-primary text-white' : 'text-dark'}`}
            style={{
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            Productivity {openProductivity ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
          <Collapse in={openProductivity}>
            <div id="productivity-collapse">
              <Nav className="flex-column mt-2">
                <Nav.Item>
                  <Nav.Link as={Link} to="/productivity/employeedailyproductivity" className={`px-3 py-2 ${isActive('/productivity/employeedailyproductivity') ? 'bg-primary text-white' : 'text-dark'}`}>Employee Daily Productivity</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/productivity/projectdailyproductivity" className={`px-3 py-2 ${isActive('/productivity/projectdailyproductivity') ? 'bg-primary text-white' : 'text-dark'}`}>Project Daily Productivity</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/productivity/employeemonthlyproductivity" className={`px-3 py-2 ${isActive('/productivity/employeemonthlyproductivity') ? 'bg-primary text-white' : 'text-dark'}`}>Employee Monthly Productivity</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/productivity/projectmonthlyproductivity" className={`px-3 py-2 ${isActive('/productivity/projectmonthlyproductivity') ? 'bg-primary text-white' : 'text-dark'}`}>Project Monthly Productivity</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </Collapse>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
