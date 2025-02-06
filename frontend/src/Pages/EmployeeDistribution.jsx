import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const EmployeeDistribution = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedBarLocation, setSelectedBarLocation] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:5000/employees');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setEmployees(data);
            } catch (e) {
                setError(e.message);
                console.error('Failed to fetch employees:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const formatPieChartData = (employees, key) => {
        const counts = {};
        employees.forEach(emp => {
            counts[emp[key]] = (counts[emp[key]] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    const roleData = useMemo(() => formatPieChartData(employees, 'role'), [employees]);
    const clientData = useMemo(() => formatPieChartData(employees, 'client'), [employees]);
    const reportingToData = useMemo(() => formatPieChartData(employees, 'reporting_to'), [employees]);

    const locationData = useMemo(() => {
        const counts = {};
        employees.forEach(emp => {
            counts[emp.location] = (counts[emp.location] || 0) + 1;
        });

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([location, value]) => ({ location, value }));
    }, [employees]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const handleChartClick = (data, key) => {
        if (data) {
            setSelectedBarLocation(null);
            setSelectedCategory(data.name);
            setFilteredEmployees(employees.filter(emp => emp[key] === data.name));
        }
    };

    const handleBarClick = (event) => {
        const location = event.activePayload?.[0]?.payload?.location;
        if (location) {
            setSelectedCategory(null);
            setSelectedBarLocation(location);
            setFilteredEmployees(employees.filter(emp => emp.location === location));
        }
    };

    const handleCloseTable = () => {
        setSelectedCategory(null);
        setSelectedBarLocation(null);
        setFilteredEmployees([]);
    };

    return (
        <div className="container mt-4">
            <h3 className="text-center">Employee Distribution</h3>
            <div className="row">
                {[{ title: 'Role', data: roleData, key: 'role', color: '#8884d8' },
                  { title: 'Client', data: clientData, key: 'client', color: '#82ca9d' },
                  { title: 'Reporting To', data: reportingToData, key: 'reporting_to', color: '#ffbb28' }].map((chart, index) => (
                    <div className="col-md-4" key={index}>
                        <h5 className="text-center">{chart.title} Distribution</h5>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chart.data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    fill={chart.color}
                                    labelLine
                                    label={({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius * 1.1;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                                                {`${name} (${value})`}
                                            </text>
                                        );
                                    }}
                                    onClick={(data) => handleChartClick(data, chart.key)}
                                >
                                    {chart.data.map((entry, i) => (
                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
            
            {filteredEmployees.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-center">Employees - {selectedCategory || selectedBarLocation}</h3>
                    <button className="btn btn-danger mb-2" onClick={handleCloseTable}>Close</button>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Emp Code</th>
                                <th>Emp Name</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.emp_code}>
                                    <td>{emp.emp_code}</td>
                                    <td>{emp.emp_name}</td>
                                    <td>{emp.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="row mt-4">
                <div className="col-md-12">
                    <h5 className="text-center">Location Distribution</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={locationData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }} onClick={handleBarClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="location" angle={-45} textAnchor="end" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8">
                                <LabelList dataKey="value" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDistribution;
