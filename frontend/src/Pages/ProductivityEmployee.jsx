import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const ProductivityCalendar = () => {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/employees");
        setEmployees(response.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees.");
      }
    };

    fetchEmployees();
  }, []);

  // Function to fetch productivity data for selected employee
  const fetchProductivityData = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/productivity?emp_code=${selectedEmployee}`
      );

      const formattedEvents = response.data.map((item) => ({
        title: `WHrs: ${item.working_hours}\nPHrs: ${item.productivity_hours}`,
        start: new Date(item.date),
        end: new Date(item.date),
        allDay: true,
        working_hours: item.working_hours,
        productivity_hours: item.productivity_hours,
        date: item.date,
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching productivity data:", err);
      setError("Failed to load productivity data.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch productivity data when employee is selected
  useEffect(() => {
    fetchProductivityData();
  }, [selectedEmployee]);

  const handleReset = async () => {
    if (!selectedEmployee) return;
    const selectedDate = events[0]?.start; // assuming the first event's date to reset for

    try {
      await axios.post("http://localhost:5000/api/reset-productivity", {
        emp_code: selectedEmployee,
        date: selectedDate.toISOString().split('T')[0], // only date portion
      });
      // Fetch data again after reset
      setEvents([]);
      fetchProductivityData();
    } catch (err) {
      console.error("Error resetting productivity:", err);
      setError("Failed to reset productivity.");
    }
  };

  const EventComponent = ({ event }) => (
    <div style={{ fontSize: "14px", lineHeight: "1.1" }}>
      <div>
        <strong>WHrs:</strong> {event.working_hours}
      </div>
      <div>
        <strong>PHrs:</strong> {event.productivity_hours}
      </div>
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        padding: "20px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div>
        <label htmlFor="employee-select">Select Employee:</label>
        <select
          id="employee-select"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map((employee) => (
            <option key={employee.emp_code} value={employee.emp_code}>
              {employee.emp_name}
            </option>
          ))}
        </select>
        <button onClick={handleReset}>Reset Productivity</button>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: "75%",
            width: "100%",
            maxWidth: "100%",
            fontSize: "14px",
          }}
          components={{
            event: EventComponent,
          }}
        />
      )}
    </div>
  );
};

export default ProductivityCalendar;
