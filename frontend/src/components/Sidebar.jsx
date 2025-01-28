import{ useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button, Collapse } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


const Sidebar = ({ sidebarItems }) => {
  const [openMonthlyReport, setOpenMonthlyReport] = useState(false);
  const location = useLocation();

  const toggleMonthlyReportSubmenu = () => {
    setOpenMonthlyReport(!openMonthlyReport);
  };

    const isActive = (path) => {
      // const currentPath = location.pathname.toLowerCase();
        const currentPath = location.pathname.toLowerCase();
        return currentPath === path;
    };


  useEffect(() => {
    // Function to check if any of the submenu links match the current path
    const checkSubMenuActive = () => {
      const currentPath = location.pathname.toLowerCase();
      const monthlyReportSubPaths = [
          "/monthlyreport/clientdelivery",
          "/monthlyreport/monthdelivery",
          "/monthlyreport/clientontime",
          "/monthlyreport/monthontime",
          "/monthlyreport/quality",
          "/monthlyreport/employeeproductivity",
      ];

      if (monthlyReportSubPaths.some(path => currentPath === path)) {
        setOpenMonthlyReport(true);
      } else {
        setOpenMonthlyReport(false);
      }
    };
    checkSubMenuActive();

  }, [location]);



  return (
    <div
        className="d-flex flex-column flex-shrink-0 bg-light border-end"
      style={{
          width: '200px',
          height: '100vh',
           paddingTop: '20px',
        }}
    >
        <Nav variant="pills" className="flex-column mb-auto">
          {sidebarItems.map((item, index) => {
            if (item === 'Monthly Report') {
              return (
                <Nav.Item key={index}>
                  <Button
                    variant="link"
                    onClick={toggleMonthlyReportSubmenu}
                    aria-controls="monthly-report-collapse"
                    aria-expanded={openMonthlyReport}
                    block
                      className={`text-start px-3 py-2 text-decoration-none ${
                        openMonthlyReport ? 'bg-primary text-white' : 'text-dark'
                      }`}
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
                    {item}
                    {openMonthlyReport ? <FaChevronUp /> : <FaChevronDown />}
                  </Button>
                  <Collapse in={openMonthlyReport}>
                    <div id="monthly-report-collapse">
                        <Nav className="flex-column mt-2">
                           <Nav.Item>
                              <Nav.Link
                                 as={Link}
                                 to="/monthlyreport/clientdelivery"
                                 className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/clientdelivery') ? 'bg-secondary text-white' : ''}`}
                              >
                                 Delivery - Clientwise
                              </Nav.Link>
                           </Nav.Item>
                           <Nav.Item>
                             <Nav.Link
                               as={Link}
                               to="/monthlyreport/monthdelivery"
                               className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/monthdelivery') ? 'bg-secondary text-white' : ''}`}
                             >
                               Delivery - Monthwise
                             </Nav.Link>
                           </Nav.Item>


                           <Nav.Item>
                             <Nav.Link
                               as={Link}
                               to="/monthlyreport/clientontime"
                               className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/clientontime') ? 'bg-secondary text-white' : ''}`}
                             >
                               Ontime - Clientwise
                             </Nav.Link>
                           </Nav.Item>
                           <Nav.Item>
                             <Nav.Link
                               as={Link}
                               to="/monthlyreport/monthontime"
                               className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/monthontime') ? 'bg-secondary text-white' : ''}`}
                             >
                               Ontime - Monthwise
                             </Nav.Link>
                           </Nav.Item>

                            <Nav.Item>
                              <Nav.Link
                                as={Link}
                                to="/monthlyreport/quality"
                                className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/quality') ? 'bg-secondary text-white' : ''}`}
                              >
                                Quality
                              </Nav.Link>
                           </Nav.Item>
                            <Nav.Item>
                              <Nav.Link
                                as={Link}
                                to="/monthlyreport/employeeproductivity"
                                className={`text-dark pl-3 ms-3 ${isActive('/monthlyreport/employeeproductivity') ? 'bg-secondary text-white' : ''}`}
                              >
                                Productivity
                              </Nav.Link>
                           </Nav.Item>
                         </Nav>
                      </div>
                  </Collapse>
                </Nav.Item>
              );
            } else {
              const path = `/${item.toLowerCase().replace(' ', '')}`;
              return (
                <Nav.Item key={index}>
                  <Nav.Link
                    as={Link}
                    to={path}
                   className={`text-decoration-none px-3 py-2 ${isActive(path) ? 'bg-primary text-white' : 'text-dark'}`}
                  >
                    {item}
                  </Nav.Link>
                </Nav.Item>
              );
            }
          })}
        </Nav>
    </div>
  );
};

export default Sidebar;