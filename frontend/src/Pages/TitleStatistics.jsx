import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

const TitleStatistics = () => {
  const [clients, setClients] = useState([]);
  const [ititles, setItitles] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedItitle, setSelectedItitle] = useState(null);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [totalDays, setTotalDays] = useState(0);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/clients');
        const clientOptions = response.data.map(client => ({
          value: client.client,
          label: client.client
        }));
        setClients(clientOptions);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  // Fetch ititles based on selected client
  useEffect(() => {
    if (selectedClient) {
      const fetchItitles = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/ititles/${selectedClient.value}`);
          const ititleOptions = response.data.map(ititle => ({
            value: ititle.ititle,
            label: ititle.ititle
          }));
          setItitles(ititleOptions);
        } catch (error) {
          console.error('Error fetching ititles:', error);
        }
      };

      fetchItitles();
    }
  }, [selectedClient]);

  // Fetch the monthly reports based on selected client and ititle
  useEffect(() => {
    if (selectedClient && selectedItitle) {
      const fetchReports = async () => {
        try {
          const response = await axios.get('http://localhost:5000/monthlyreport', {
            params: {
              client: selectedClient.value,
              ititle: selectedItitle.value
            }
          });
          setMonthlyReports(response.data);
          // Calculate total days by summing the digits of working days
           const totalDays = response.data.reduce((sum, report) => {
               const workingDaysSum = String(report.working_days)
                .split('')
                .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
             return sum + workingDaysSum;
           }, 0);

          setTotalDays(totalDays);
        } catch (error) {
          console.error('Error fetching monthly reports:', error);
        }
      };

      fetchReports();
    }
  }, [selectedClient, selectedItitle]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Monthly Report</h1>

      <div className="mb-3">
        <label className="form-label">Select Client</label>
        <Select
          options={clients}
          value={selectedClient}
          onChange={setSelectedClient}
          placeholder="Select Client"
          className="mb-2"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Select Ititle</label>
        <Select
          options={ititles}
          value={selectedItitle}
          onChange={setSelectedItitle}
          placeholder="Select Ititle"
          className="mb-2"
          isSearchable
        />
      </div>

      {monthlyReports.length > 0 && (
        <>
          <div className="mb-3">
            <h5>Total no of days spend on {selectedItitle?.label}: {totalDays} days</h5>
          </div>
          <div className="table-responsive mt-4">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Client</th>
                  <th>Division</th>
                  <th>Ititle</th>
                  <th>Stage</th>
                  <th>Pages</th>
                  <th>Corrections</th>
                  <th>Received Date</th>
                  <th>Actual Date</th>
                  <th>Proposed Date</th>
                  <th>Delivered Date</th>
                  <th>Working Days</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.client}</td>
                    <td>{report.division}</td>
                    <td>{report.ititle}</td>
                    <td>{report.stage}</td>
                    <td>{report.pages}</td>
                    <td>{report.corrections}</td>
                    <td>{report.received_date}</td>
                    <td>{report.actual_date}</td>
                    <td>{report.proposed_date}</td>
                    <td>{report.delivered_date}</td>
                    <td>{report.working_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TitleStatistics;