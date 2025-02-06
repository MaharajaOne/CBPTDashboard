// EmployeeList.jsx
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        emp_code: '',
        emp_name: '',
        reporting_to: '',
        email: '',
        role: '',
        department: '',
        designation: '',
        client: '',
        user_status: 'Active',
        replacement: '',
        reason_for_relieving: '',
        address: '',
        primary_contact_no: '',
        secondary_contact_no: '',
        location: '',
    });
    const [editingEmpCode, setEditingEmpCode] = useState(null);
    const [editEmployee, setEditEmployee] = useState({
        emp_code: '',
        emp_name: '',
        reporting_to: '',
        email: '',
        role: '',
        department: '',
        designation: '',
        client: '',
        user_status: 'Active',
        replacement: '',
        reason_for_relieving: '',
        address: '',
        primary_contact_no: '',
        secondary_contact_no: '',
        location: '',
    });
    const [columnVisibility, setColumnVisibility] = useState({
        emp_code: true,
        emp_name: true,
        reporting_to: true,
        email: false,
        role: true,
        department: false,
        designation: false,
        client: true,
        user_status: false,
        replacement: false,
        reason_for_relieving: false,
        address: false,
        primary_contact_no: false,
        secondary_contact_no: false,
        location: false,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const handleColumnToggle = (column) => {
        setColumnVisibility((prevState) => ({
            ...prevState,
            [column]: !prevState[column],
        }));
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            } else {
                console.error('Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
      const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditEmployee((prevState) => ({
            ...prevState,
             [name]: value,
        }));
    };

    const handleAddEmployee = async () => {
         try {
            const response = await fetch('http://localhost:5000/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEmployee),
            });
            if (response.ok) {
                setNewEmployee({
                  emp_code: '',
                  emp_name: '',
                  reporting_to: '',
                  email: '',
                  role: '',
                  department: '',
                  designation: '',
                  client: '',
                  user_status: 'Active',
                  replacement: '',
                  reason_for_relieving: '',
                  address: '',
                  primary_contact_no: '',
                  secondary_contact_no: '',
                  location: '',
                });
                setShowAddModal(false);
                fetchEmployees();
            } else {
                console.error('Failed to add employee');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

   const handleEditEmployee = (emp) => {
        setEditingEmpCode(emp.emp_code);
        setEditEmployee(emp)
    }

    const handleCancelEdit = () => {
       setEditingEmpCode(null);
      setEditEmployee({
        emp_code: '',
        emp_name: '',
        reporting_to: '',
        email: '',
        role: '',
        department: '',
        designation: '',
        client: '',
        user_status: 'Active',
        replacement: '',
        address: '',
        primary_contact_no: '',
        secondary_contact_no: '',
        location: '',
      });
   };

    const handleUpdateEmployee = async () => {
         try {
            const response = await fetch(`http://localhost:5000/employees/${editingEmpCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editEmployee),
            });
            if (response.ok) {
                 setEditingEmpCode(null);
                 setEditEmployee({
                   emp_code: '',
                    emp_name: '',
                    reporting_to: '',
                   email: '',
                   role: '',
                   department: '',
                   designation: '',
                   client: '',
                   user_status: 'Active',
                   replacement: '',
                    address: '',
                   primary_contact_no: '',
                   secondary_contact_no: '',
                   location: '',
                  });
                 fetchEmployees();
            } else {
                console.error("Failed to update the employee")
            }
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleDeleteEmployee = async (empCode) => {
        try {
            const response = await fetch(`http://localhost:5000/employees/${empCode}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                 fetchEmployees();
            } else {
                console.error('Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    //search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    const filteredEmployees = employees.filter(emp =>
        Object.values(emp).some(value =>
            value && String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (sortConfig.key === null) return 0;
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        if (a[key] < b[key]) return -1 * direction;
        if (a[key] > b[key]) return 1 * direction;
        return 0;
    });

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2>Employee List</h2>
                <div>
                    <button
                        className="btn btn-success btn-sm position-relative"
                        onClick={() => setShowAddModal(true)}
                        title="Add New Employee"
                    >
                        <i className="bi bi-plus"></i>
                    </button>
               </div>
            </div>
           <div>
             {Object.keys(columnVisibility).map((column) => (
                   <div className="form-check form-check-inline" key={column}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                             id={`checkbox-${column}`}
                            checked={columnVisibility[column]}
                            onChange={() => handleColumnToggle(column)}
                        />
                        <label className="form-check-label" htmlFor={`checkbox-${column}`}>
                            {column.replace(/_/g, ' ')}
                        </label>
                    </div>
                ))}
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Employee"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <table className="table table-striped table-sm mt-4">
                <thead>
                    <tr>
                         {columnVisibility.emp_code && (
                             <th onClick={() => handleSort('emp_code')}>Emp Code {sortConfig.key === 'emp_code' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                         )}
                        {columnVisibility.emp_name && (
                             <th onClick={() => handleSort('emp_name')}>Emp Name {sortConfig.key === 'emp_name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                         )}
                         {columnVisibility.reporting_to && (
                            <th onClick={() => handleSort('reporting_to')}>Reporting To {sortConfig.key === 'reporting_to' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                        {columnVisibility.email &&(
                            <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                       {columnVisibility.role && (
                            <th onClick={() => handleSort('role')}>Role {sortConfig.key === 'role' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                       {columnVisibility.department && (
                          <th onClick={() => handleSort('department')}>Department {sortConfig.key === 'department' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                        {columnVisibility.designation && (
                           <th onClick={() => handleSort('designation')}>Designation {sortConfig.key === 'designation' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                         )}
                        {columnVisibility.client && (
                           <th onClick={() => handleSort('client')}>Client {sortConfig.key === 'client' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                        {columnVisibility.user_status && (
                           <th onClick={() => handleSort('user_status')}>Status {sortConfig.key === 'user_status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                        {columnVisibility.replacement &&(
                            <th onClick={() => handleSort('replacement')}>Replacement {sortConfig.key === 'replacement' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                         {columnVisibility.reason_for_relieving && (
                            <th onClick={() => handleSort('reason_for_relieving')}>Reason for Relieving {sortConfig.key === 'reason_for_relieving' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                          {columnVisibility.address &&(
                            <th onClick={() => handleSort('address')}>Address {sortConfig.key === 'address' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                        {columnVisibility.primary_contact_no && (
                           <th onClick={() => handleSort('primary_contact_no')}>Primary Contact No {sortConfig.key === 'primary_contact_no' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                         )}
                        {columnVisibility.secondary_contact_no && (
                            <th onClick={() => handleSort('secondary_contact_no')}>Secondary Contact No {sortConfig.key === 'secondary_contact_no' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                        )}
                         {columnVisibility.location && (
                           <th onClick={() => handleSort('location')}>Location {sortConfig.key === 'location' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}</th>
                         )}
                           <th>Actions</th>
                    </tr>
                </thead>
               <tbody>
                    {sortedEmployees.map((emp, index) => (
                        <tr key={emp.emp_code} className={index % 2 === 0 ? 'table-light' : ''}>
                            {columnVisibility.emp_code &&  <td>{emp.emp_code}</td>}
                            {columnVisibility.emp_name && <td>{emp.emp_name}</td>}
                            {columnVisibility.reporting_to && <td>{emp.reporting_to}</td>}
                            {columnVisibility.email && <td>{emp.email}</td>}
                             {columnVisibility.role && <td>{emp.role}</td>}
                            {columnVisibility.department && <td>{emp.department}</td>}
                            {columnVisibility.designation && <td>{emp.designation}</td>}
                            {columnVisibility.client && <td>{emp.client}</td>}
                            {columnVisibility.user_status && <td>{emp.user_status}</td>}
                             {columnVisibility.replacement && <td>{emp.replacement}</td>}
                            {columnVisibility.reason_for_relieving && <td>{emp.reason_for_relieving}</td>}
                            {columnVisibility.address && <td>{emp.address}</td>}
                            {columnVisibility.primary_contact_no && <td>{emp.primary_contact_no}</td>}
                            {columnVisibility.secondary_contact_no && <td>{emp.secondary_contact_no}</td>}
                            {columnVisibility.location && <td>{emp.location}</td>}
                            <td>
                                {editingEmpCode === emp.emp_code ? (
                                    <>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        name="emp_name"
                                        placeholder="Emp Name"
                                           value={editEmployee.emp_name}
                                            onChange={handleEditInputChange}
                                       />
                                        <input
                                             type="text"
                                              className="form-control form-control-sm"
                                          name="reporting_to"
                                              placeholder="Reporting To"
                                            value={editEmployee.reporting_to}
                                            onChange={handleEditInputChange}
                                        />
                                      <input
                                             type="text"
                                              className="form-control form-control-sm"
                                           name="email"
                                           placeholder="Email"
                                              value={editEmployee.email}
                                            onChange={handleEditInputChange}
                                        />
                                       <input
                                              type="text"
                                              className="form-control form-control-sm"
                                            name="role"
                                          placeholder="Role"
                                              value={editEmployee.role}
                                            onChange={handleEditInputChange}
                                        />
                                      <input
                                             type="text"
                                             className="form-control form-control-sm"
                                            name="department"
                                           placeholder="Department"
                                            value={editEmployee.department}
                                          onChange={handleEditInputChange}
                                        />
                                        <input
                                              type="text"
                                              className="form-control form-control-sm"
                                            name="designation"
                                            placeholder="Designation"
                                            value={editEmployee.designation}
                                            onChange={handleEditInputChange}
                                       />
                                     <input
                                             type="text"
                                             className="form-control form-control-sm"
                                           name="client"
                                            placeholder="Client"
                                              value={editEmployee.client}
                                           onChange={handleEditInputChange}
                                        />
                                        <input
                                            type="text"
                                             className="form-control form-control-sm"
                                          name="replacement"
                                            placeholder="Replacement"
                                           value={editEmployee.replacement}
                                             onChange={handleEditInputChange}
                                        />
                                      <input
                                              type="text"
                                               className="form-control form-control-sm"
                                          name="reason_for_relieving"
                                              placeholder="Reason for Relieving"
                                           value={editEmployee.reason_for_relieving}
                                             onChange={handleEditInputChange}
                                       />
                                     <input
                                             type="text"
                                              className="form-control form-control-sm"
                                            name="address"
                                             placeholder="Address"
                                            value={editEmployee.address}
                                          onChange={handleEditInputChange}
                                       />
                                       <input
                                             type="text"
                                             className="form-control form-control-sm"
                                             name="primary_contact_no"
                                           placeholder="Primary Contact No"
                                            value={editEmployee.primary_contact_no}
                                            onChange={handleEditInputChange}
                                        />
                                      <input
                                             type="text"
                                              className="form-control form-control-sm"
                                            name="secondary_contact_no"
                                             placeholder="Secondary Contact No"
                                              value={editEmployee.secondary_contact_no}
                                            onChange={handleEditInputChange}
                                        />
                                         <input
                                           type="text"
                                            className="form-control form-control-sm"
                                           name="location"
                                             placeholder="Location"
                                           value={editEmployee.location}
                                            onChange={handleEditInputChange}
                                        />
                                        <button onClick={handleUpdateEmployee} className="btn btn-success btn-sm">
                                            <i className="bi bi-check-lg"></i>
                                        </button>
                                        <button onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                         <button onClick={() => handleEditEmployee(emp)} className="btn btn-info btn-sm">
                                          <i className="bi bi-pencil"></i>
                                       </button>
                                       <button onClick={() => handleDeleteEmployee(emp.emp_code)} className="btn btn-danger btn-sm">
                                           <i className="bi bi-trash"></i>
                                       </button>
                                    </>
                                )}
                           </td>
                         </tr>
                   ))}
               </tbody>
            </table>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="emp_code"
                            placeholder="Emp Code"
                           value={newEmployee.emp_code}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                       <input
                           type="text"
                            className="form-control form-control-sm"
                            name="emp_name"
                            placeholder="Emp Name"
                           value={newEmployee.emp_name}
                           onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                         <input
                           type="text"
                            className="form-control form-control-sm"
                            name="reporting_to"
                           placeholder="Reporting To"
                             value={newEmployee.reporting_to}
                           onChange={handleInputChange}
                        />
                     </div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                           name="email"
                            placeholder="Email"
                           value={newEmployee.email}
                             onChange={handleInputChange}
                        />
                    </div>
                     <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="role"
                            placeholder="Role"
                           value={newEmployee.role}
                           onChange={handleInputChange}
                        />
                     </div>
                     <div className="mb-3">
                       <input
                            type="text"
                            className="form-control form-control-sm"
                            name="department"
                           placeholder="Department"
                             value={newEmployee.department}
                            onChange={handleInputChange}
                       />
                     </div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="designation"
                            placeholder="Designation"
                            value={newEmployee.designation}
                           onChange={handleInputChange}
                        />
                    </div>
                     <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="client"
                           placeholder="Client"
                            value={newEmployee.client}
                           onChange={handleInputChange}
                        />
                    </div>
                      <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="replacement"
                            placeholder="Replacement"
                           value={newEmployee.replacement}
                           onChange={handleInputChange}
                        />
                    </div>
                     <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                           name="reason_for_relieving"
                           placeholder="Reason for Relieving"
                            value={newEmployee.reason_for_relieving}
                             onChange={handleInputChange}
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            name="address"
                            placeholder="Address"
                            value={newEmployee.address}
                             onChange={handleInputChange}
                        />
                    </div>
                     <div className="mb-3">
                       <input
                            type="text"
                            className="form-control form-control-sm"
                            name="primary_contact_no"
                            placeholder="Primary Contact No"
                            value={newEmployee.primary_contact_no}
                            onChange={handleInputChange}
                       />
                     </div>
                      <div className="mb-3">
                         <input
                             type="text"
                             className="form-control form-control-sm"
                            name="secondary_contact_no"
                           placeholder="Secondary Contact No"
                           value={newEmployee.secondary_contact_no}
                            onChange={handleInputChange}
                        />
                    </div>
                      <div className="mb-3">
                         <input
                            type="text"
                             className="form-control form-control-sm"
                           name="location"
                           placeholder="Location"
                            value={newEmployee.location}
                            onChange={handleInputChange}
                        />
                     </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleAddEmployee}>
                        Add Employee
                   </button>
                </Modal.Footer>
           </Modal>
        </div>
    );
};

export default EmployeeList;