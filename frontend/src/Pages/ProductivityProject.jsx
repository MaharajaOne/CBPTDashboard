import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const localizer = momentLocalizer(moment);

const ProductivityProject = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductivityData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Remove the emp_code query parameter
                const response = await axios.get(`http://localhost:5000/api/productivity`); // Assuming your API returns data for all employees

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

        fetchProductivityData();
    }, []);

    const handleSelectSlot = (event) => {
        // Prevent event creation when clicking an existing event
    };

    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                {/* 70% Section - Placeholder for your content */}
                <div className="col-md-7 border">
                    <h2>Main Content Area (70%)</h2>
                    <p>This section will contain your primary content. Replace this placeholder with your desired elements.</p>
                </div>

                {/* 30% Section - Calendar */}
                <div className="col-md-5 border">
                    <h2 className="text-center my-3">Calendar (30%)</h2>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-danger">{error}</p>}
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        titleAccessor="title"
                        style={{ height: '80vh' }}
                        views={['month', 'agenda']}
                        defaultView="month"
                        selectable={false}
                        onSelectSlot={handleSelectSlot}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductivityProject;