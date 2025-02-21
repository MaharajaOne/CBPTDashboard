import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const ProductivityCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductivityData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token"); // Fetch token for auth
        const response = await axios.get("http://localhost:5000/productivity-data", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedEvents = response.data.map((item) => ({
          title: `Working Hour: ${item.working_hours}\nProductivity Hour: ${item.productivity_hours}`,
          start: new Date(item.date),
          end: new Date(item.date),
          allDay: true,
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching productivity data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductivityData();
  }, []);

  return (
    <div style={{ height: "80vh" }}>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default ProductivityCalendar;
