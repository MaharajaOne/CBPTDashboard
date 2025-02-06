import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LabelList,
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const MonthOntime = () => {
    const componentRef = useRef(null);
    const [chartData, setChartData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const storedMonth = localStorage.getItem('selectedMonth');
        return storedMonth ? storedMonth : `${new Date().getFullYear()}-01`;
    });
    const [years] = useState(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear - 2, currentYear - 1, currentYear];
    });


    const barColor1 = "#e57373";
    const barColor2 = "#EEDC82";
    const barColor3 = "#82ca9d";

    const hexToRgba = (hex, opacity) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
            : null;
    };


    useEffect(() => {
        fetchChartData(selectedMonth);
    }, [selectedMonth]);

    useEffect(() => {
        localStorage.setItem('selectedMonth', selectedMonth);
    }, [selectedMonth]);

    const fetchChartData = async (month = '') => {
        try {
            const response = await axios.get(
                'http://localhost:5000/month-ontime-data',
                {
                    params: { month },
                }
            );
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const renderMonthDropdown = (selectedMonth, setSelectedMonth, label) => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const selectedYear = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
        const selectedMon = selectedMonth ? selectedMonth.split('-')[1] : null;

        return (
            <div className="d-flex align-items-center mb-3">
                <label className="form-label me-2 mt-1">{label} Month</label>
                <div className="me-2">
                    <select
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => {
                            const newMonth = e.target.value + (selectedMon ? `-${selectedMon}` : '');
                            setSelectedMonth(newMonth);
                        }}
                        style={{ width: 'auto' }}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <select
                    className="form-select"
                    value={selectedMon}
                    onChange={(e) => {
                        const newMonth = selectedYear + `-${e.target.value}`;
                        setSelectedMonth(newMonth);
                    }}
                    style={{ width: 'auto' }}
                >
                    <option value="">Select Month</option>
                    {months.map((mon, index) => (
                        <option key={index} value={(index + 1).toString().padStart(2, '0')}>{mon}</option>
                    ))}
                </select>
            </div>
        );
    }

    const transformChartData = (data) => {
        const groupedData = {};
        data.forEach((item) => {
            const client = item.client;
            if (!groupedData[client]) {
                groupedData[client] = {
                    client,
                    late_titles: 0,
                    met_revised_titles: 0,
                    met_original_titles: 0,
                };
            }
            groupedData[client].late_titles += Number(item.late_titles);
            groupedData[client].met_revised_titles += Number(
                item.met_revised_titles
            );
            groupedData[client].met_original_titles += Number(
                item.met_original_titles
            );
        });

        const sortedData = Object.values(groupedData).sort((a, b) => {
            const totalA =
                a.late_titles + a.met_revised_titles + a.met_original_titles;
            const totalB =
                b.late_titles + b.met_revised_titles + b.met_original_titles;
            return totalB - totalA;
        });

        return sortedData;
    };

    const renderChartWithTable = (stageData, title) => {
        if (!stageData || stageData.length === 0) {
            return (
                <div className="col-12 mb-3 border bg-light p-3 text-center">
                    No data available for {title}
                </div>
            );
        }

        const transformedData = transformChartData(stageData);

        const maxYValue = Math.max(
            ...transformedData.map(
                (item) =>
                    Math.max(
                        item.late_titles,
                        item.met_revised_titles,
                        item.met_original_titles
                    ) || 0
            )
        );
        const yAxisMax = Math.ceil(maxYValue * 1.2);

        const tableStyle = {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
        };
        const thStyle = {
            border: '1px solid #ddd',
            padding: '6px',
            textAlign: 'center',
        };
        const tdStyle = {
            border: '1px solid #ddd',
            padding: '4px',
            textAlign: 'left',
            lineHeight: '1',
            whiteSpace: 'nowrap',
        };
        const enhancedData = transformedData.map((item) => {
            const totalTitles =
                Number(item.late_titles) +
                Number(item.met_revised_titles) +
                Number(item.met_original_titles);
            const delayPercentage =
                totalTitles === 0
                    ? 0
                    : ((Number(item.late_titles) / totalTitles) * 100).toFixed(1);
            return {
                ...item,
                total_titles: totalTitles,
                delay_percentage: delayPercentage,
            };
        });
        const chartHeight = Math.max(275, transformedData.length * 50);

        return (
            <div className="mb-3">  {/* Changed from row to a div */}
                {/* Chart Section */}
                <div className="border p-3 bg-light">
                    <h5 className="text-center">{title}</h5>
                    <ResponsiveContainer width="100%" height={275}>
                        <BarChart
                            data={enhancedData}
                            margin={{ top: 30, right: 30, left: 20, bottom: 70 }}
                        >
                            <Legend
                                width="auto"
                                wrapperStyle={{
                                    bottom: 0,
                                    right: 10,
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #d5d5d5',
                                    borderRadius: 3,
                                    lineHeight: '10px',
                                }}
                                formatter={(value) => <span style={{ color: 'black' }}>{value}</span>}
                            />
                            <XAxis
                                dataKey="client"
                                label={{
                                    value: 'Client',
                                    position: 'insideBottom',
                                    offset: -40,
                                }}
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis
                                label={{
                                    value: 'No of Titles',
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                                domain={[0, yAxisMax]}
                            />
                            <Tooltip />

                            <Bar
                                dataKey="met_original_titles"
                                fill={barColor3}
                                name="Met original Date"
                            >
                                <LabelList dataKey="met_original_titles" position="top" />
                            </Bar>
                            <Bar
                                dataKey="met_revised_titles"
                                fill={barColor2}
                                name="Met revised date"
                            >
                                <LabelList dataKey="met_revised_titles" position="top" />
                            </Bar>
                            <Bar
                                dataKey="late_titles"
                                fill={barColor1}
                                name="Delivered Late"
                            >
                                <LabelList dataKey="late_titles" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Table Section */}
                <div className="border p-3 bg-light" style={{ overflow: 'auto', maxHeight: '400px' }}>
                    <h6 className="text-center">Data Table</h6>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Client</th>
                                <th style={thStyle}>Met Original</th>
                                <th style={thStyle}>Met Revised</th>
                                <th style={thStyle}>Late Titles</th>
                                <th style={thStyle}>Total Titles</th>
                                <th style={thStyle}>Delay %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enhancedData.map((row, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        backgroundColor:
                                            index % 2 === 0
                                                ? 'transparent'
                                                : hexToRgba("#2a623d", 0.1),
                                    }}
                                >
                                    <td style={tdStyle}>{row.client}</td>

                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {row.met_original_titles}
                                    </td>


                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {row.met_revised_titles}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {row.late_titles}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {row.total_titles}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {row.delay_percentage}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="container mt-1" ref={componentRef}>
            <h2 className="text-center mb-2">Monthwise Ontime Report</h2>
            <div className="row">
                <div className='col-md-12'>
                    {renderMonthDropdown(selectedMonth, setSelectedMonth, 'Select')}
                </div>
            </div>

            {selectedMonth && (
                <div className="row">
                    <div className="col-md-12 text-center mb-4">
                        <h6>Selected Month: {selectedMonth}</h6>
                    </div>
                </div>
            )}

            {/* place tables one by one */}
            {renderChartWithTable(
                chartData.filter((item) => item.normalized_stage === '01_FPP'),
                `FPP Stage - ${selectedMonth || 'All Months'}`
            )}

            {renderChartWithTable(
                chartData.filter((item) => item.normalized_stage === '03_Finals'),
                `Finals Stage - ${selectedMonth || 'All Months'}`
            )}

            {renderChartWithTable(
                chartData.filter((item) => item.normalized_stage === '02_Revises-1'),
                `Revises-1 Stage - ${selectedMonth || 'All Months'}`
            )}

            {renderChartWithTable(
                chartData.filter(
                    (item) => item.normalized_stage === '04_Other Deliveries'
                ),
                `Other Deliveries Stage - ${selectedMonth || 'All Months'}`
            )}
        </div>
    );
};

export default MonthOntime;