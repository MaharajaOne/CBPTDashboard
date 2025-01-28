import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const PerformanceReport = () => {
    const [clients, setClients] = useState([]);
    const [months, setMonths] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [reportData, setReportData] = useState([]);
    const [revisesData, setRevisesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tatData, setTatData] = useState([]);
    const [showTatReport, setShowTatReport] = useState(false);
     const [onTimeData, setOnTimeData] = useState([]);


    const barColor1 = "#e57373"; // for titles
    const barColor2 = "#EEDC82"; // for pages
    const barColor3 = "#4CAF50"; // for revises titles
    const barColor4 = "#9C27B0"; // for other deliveries
    const barColor5 = "#2196F3";
     const barColor6 = "#2196F3"; // for met original date
    const barColor7 = "#FFC107"; // for met revised date
    const barColor8 = "#F44336";  // for delivered late

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const token = localStorage.getItem('token');
                const clientResponse = await axios.get('http://localhost:5000/client-delivery-data-filters', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const monthResponse = await axios.get('http://localhost:5000/month-delivery-data-filters', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setClients(clientResponse.data.clients);
                setMonths(monthResponse.data.months);

            } catch (err) {
                console.error('Error fetching filters:', err);
                setError(err.message || 'Failed to fetch filters');
            }
        };
        fetchFilters();
    }, []);


    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        setShowTatReport(false);
        try {
            const token = localStorage.getItem('token');
            console.log("Selected Client:", selectedClient)
            console.log("Selected Month:", selectedMonth)
             const fppResponse = await axios.get('http://localhost:5000/client-delivery-data', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth,
                    stage: '01_FPP',
                },
            });
            console.log("fppResponse.data", fppResponse.data)
            const finalsResponse = await axios.get('http://localhost:5000/client-delivery-data', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth,
                    stage: '03_Finals',
                },
            });
            console.log("finalsResponse.data", finalsResponse.data)

            const revisesResponse = await axios.get('http://localhost:5000/client-delivery-data', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth,
                    stage: '02_Revises-1',
                },
            });
             console.log("revisesResponse.data", revisesResponse.data)
            const otherDeliveriesResponse = await axios.get('http://localhost:5000/client-delivery-data', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth,
                    stage: '04_Other Deliveries',
                },
            });
             console.log("otherDeliveriesResponse.data", otherDeliveriesResponse.data)

            const fppData = fppResponse.data[0];
            const finalsData = finalsResponse.data[0];
            const revisesData = revisesResponse.data[0];
            const otherDeliveriesData = otherDeliveriesResponse.data[0];


            let calculatedFinalPages = 0;

            if (fppData && finalsData) {
                const fppTitleCount = fppData.title_count || 1; // Avoid division by zero
                const fppSumPages = fppData.sum_pages || 0;
                const finalsTitleCount = finalsData.title_count || 0;


                calculatedFinalPages = Math.round((finalsTitleCount * (fppSumPages / fppTitleCount)));

            }

            setReportData([
                {
                    stage: '01_FPP',
                    title_count: fppData ? fppData.title_count : 0,
                    sum_pages: fppData ? fppData.sum_pages : 0,
                },
                {
                    stage: '03_Finals',
                    title_count: finalsData ? finalsData.title_count : 0,
                    sum_pages: calculatedFinalPages,
                }
            ]);

            setRevisesData([
                {
                    stage: '02_Revises-1',
                    title_count: revisesData ? revisesData.title_count : 0,
                    sum_corrections: revisesData ? revisesData.sum_corrections : 0,
                },
                {
                    stage: '04_Other Deliveries',
                    title_count: otherDeliveriesData ? otherDeliveriesData.title_count : 0,
                    sum_corrections: otherDeliveriesData ? otherDeliveriesData.sum_corrections : 0,
                }
            ]);
            const tatResponse = await axios.get('http://localhost:5000/fp-delivery-report', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth
                }
            });
            console.log("tatResponse.data", tatResponse.data)
            const formattedTatData = tatResponse.data.map(item => ({
                days: item.working_days_category,
                titles: item.fp_title_count
            }));

            const completeTatArray = [
                  { days: "0-5", titles: formattedTatData.find(item => item.days === '0-5')?.titles || 0 },
                { days: "6-7", titles: formattedTatData.find(item => item.days === '6-7')?.titles || 0 },
                { days: "8-10", titles: formattedTatData.find(item => item.days === '8-10')?.titles || 0 },
                { days: "11-14", titles: formattedTatData.find(item => item.days === '11-14')?.titles || 0 },
                { days: "15-21", titles: formattedTatData.find(item => item.days === '15-21')?.titles || 0 },
                { days: ">21", titles: formattedTatData.find(item => item.days === '>21')?.titles || 0 }
            ];

            setTatData(completeTatArray);
            setShowTatReport(true);

            const onTimeResponse = await axios.get('http://localhost:5000/month-ontime-data', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    client: selectedClient,
                    month: selectedMonth
                }
            });
           console.log("onTimeResponse.data", onTimeResponse.data);
           setOnTimeData(onTimeResponse.data);

        } catch (err) {
            console.error('Error fetching report data:', err);
            setError(err.message || 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (e) => {
        setSelectedClient(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchReportData();
    };

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container">
            <h2>Performance Report</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Client:</label>
                    <select className="form-select" value={selectedClient} onChange={handleClientChange}>
                        <option value="">Select Client</option>
                        {clients.map(client => (
                            <option key={client} value={client}>{client}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Month:</label>
                    <select className="form-select" value={selectedMonth} onChange={handleMonthChange}>
                        <option value="">Select Month</option>
                        {months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Generate Report'}
                </button>
            </form>

            {reportData.length > 0 && (
                <div className="mt-4">
                    <h3>First Proof and Finals:</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="title_count" name="Title Count" fill={barColor1} barSize={30} />
                            <Bar yAxisId="right" dataKey="sum_pages" name="Pages" fill={barColor2} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>Title Count</th>
                                <th>Sum Pages</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map(row => (
                                <tr key={row.stage}>
                                    <td>{row.stage}</td>
                                    <td>{row.title_count}</td>
                                    <td>{row.sum_pages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {revisesData.length > 0 && (
                <div className="mt-4">
                    <h3>Revises and Others:</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={revisesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis yAxisId="left" orientation="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="title_count" name="Title Count" fill={barColor3} barSize={30} />
                            <Bar yAxisId="right" dataKey="sum_corrections" name="Corrections" fill={barColor4} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>Title Count</th>
                                <th>Sum Corrections</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revisesData.map(row => (
                                <tr key={row.stage}>
                                    <td>{row.stage}</td>
                                    <td>{row.title_count}</td>
                                    <td>{row.sum_corrections}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {showTatReport && tatData.length > 0 && (
                <div className="mt-4">
                    <h3>Titles vs TAT (FPP Stage Only):</h3>
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={tatData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="days" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="titles" fill={barColor5} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Days</th>
                                <th>Titles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tatData.map(row => (
                                <tr key={row.days}>
                                    <td>{row.days}</td>
                                    <td>{row.titles}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {onTimeData.length > 0 && (
                <div className="mt-4">
                    <h3>On-Time Delivery Statistics:</h3>
                     <ResponsiveContainer width="100%" height={400}>
                       <BarChart data={onTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="normalized_stage" />
                           <YAxis />
                           <Tooltip />
                           <Legend />
                           <Bar dataKey="met_original_titles" name="Met original date" fill={barColor6} barSize={30} />
                           <Bar dataKey="met_revised_titles" name="Met revised date" fill={barColor7} barSize={30} />
                            <Bar dataKey="late_titles" name="Delivered late" fill={barColor8} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>

                      <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>Met Original Titles</th>
                                 <th>Met Revised Titles</th>
                                  <th>Late Titles</th>

                            </tr>
                        </thead>
                        <tbody>
                            {onTimeData.map(row => (
                                <tr key={row.normalized_stage}>
                                    <td>{row.normalized_stage}</td>
                                    <td>{row.met_original_titles}</td>
                                     <td>{row.met_revised_titles}</td>
                                      <td>{row.late_titles}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PerformanceReport;