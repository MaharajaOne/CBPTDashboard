import  { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { LabelList } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const MonthDelivery = () => {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        return localStorage.getItem('selectedMonth') || '';
    });
    const [chartsData, setChartsData] = useState({
        FPP: [],
        Finals: [],
        Revises: [],
        OtherDeliveries: [],
    });

    useEffect(() => {
        fetchMonths();
        if (selectedMonth) {
            fetchChartData(selectedMonth);
        } else {
            fetchChartData();
        }
    }, [selectedMonth]);

    useEffect(() => {
        localStorage.setItem('selectedMonth', selectedMonth);
    }, [selectedMonth]);

    const fetchMonths = async () => {
        try {
            const response = await axios.get('http://localhost:5000/month-delivery-data-filters');

            setMonths(response.data.months);
        } catch (error) {
            console.error('Error fetching months:', error);
        }
    };

    const fetchChartData = async (month = '') => {
        try {
            const fppResponse = await axios.get('http://localhost:5000/month-delivery-data', {
                params: { month, stage: '01_FPP' },
            });
            const finalsResponse = await axios.get('http://localhost:5000/month-delivery-data', {
                params: { month, stage: '03_Finals' },
            });

            const revisesResponse = await axios.get('http://localhost:5000/month-delivery-data', {
                params: { month, stage: '02_Revises-1' },
            });

            const otherDeliveriesResponse = await axios.get('http://localhost:5000/month-delivery-data', {
                params: { month, stage: '04_Other Deliveries' },
            });


            setChartsData({ FPP: fppResponse.data, Finals: finalsResponse.data, Revises: revisesResponse.data, OtherDeliveries: otherDeliveriesResponse.data });
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const handleMonthClick = (month) => {
        setSelectedMonth(month);
    };

    const hexToRgba = (hex, opacity) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
    };

    const renderChartWithTable = (
        data,
        title,
        dataKey1,
        name1,
        dataKey2,
        name2,
        yAxisLabel1,
        yAxisLabel2
    ) => {
        if (!data || data.length === 0) {
            return (
                <div className="col-12 mb-3 border bg-light p-3">
                    No data available for {title}
                </div>
            );
        }

        const sortedData = [...data].sort((a, b) => b[dataKey1] - a[dataKey1]);

        const maxValue1 = Math.max(...sortedData.map((item) => Number(item[dataKey1])), 0);
        const yAxisMax1 = Math.ceil(maxValue1 * 1.2);

          //Conditionally determine if the chart needs 2 Y axis values
        let hasTwoYAxis = dataKey2 && dataKey2.length > 0;
        let yAxisMax2 = null;

        if(hasTwoYAxis)
            yAxisMax2 = Math.ceil(Math.max(...sortedData.map((item) => Number(item[dataKey2])), 0) * 1.2);


        const barColor1 = "#8884d8";
        const barColor2 = "#82ca9d";

         const tableStyle = {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '6px',
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


        return (
             <div className="row mb-4"     style={{ height: '400px' }}>
                {/* Chart Section */}
                <div className="col-8 border lg-7 p-3 bg-light">
                    <h5 className="text-center">{title}</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={sortedData}
                            margin={{ top: 60, right: 30, left: 20, bottom: 70 }}
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
                            />                            <XAxis
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
                                yAxisId="left"
                                label={{
                                    value: yAxisLabel1,
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: -5,
                                }}
                                domain={[0, yAxisMax1]}
                            />
                           {hasTwoYAxis && (
                               <YAxis
                                yAxisId="right"
                                orientation="right"
                                label={{
                                     value: yAxisLabel2,
                                     angle: 90,
                                     position: 'insideRight',
                                     offset: -5,
                                 }}
                                 domain={[0, yAxisMax2]}
                            />
                           )}
                            <Tooltip />

                            <Bar
                                yAxisId="left"
                                dataKey={dataKey1}
                                fill={barColor1}
                                name={name1}
                            >
                                <LabelList dataKey={dataKey1} position="top" angle={-90} offset={15} />
                            </Bar>
                             {hasTwoYAxis && (
                                <Bar
                                    yAxisId="right"
                                    dataKey={dataKey2}
                                    fill={barColor2}
                                    name={name2}
                                >
                                    <LabelList dataKey={dataKey2} position="top" angle={-90} offset={30} />
                                </Bar>
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Table Section */}
                <div className="col-4 border p-3 bg-light">
                    <h6 className="text-center">Data Table</h6>
                      <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Client</th>
                                <th style={thStyle}>{name1}</th>
                                {dataKey2 && <th style={thStyle}>{name2}</th>}
                            </tr>
                        </thead>

                        <tbody>
                             {sortedData.map((row, index) => (
                                 <tr
                                    key={index}
                                    style={{ backgroundColor: index % 2 === 0 ? 'transparent' :  hexToRgba("#2a623d", 0.1) }}
                                >
                                    <td style={tdStyle}>{row.client}</td>
                                    <td style={{
                        ...tdStyle,
                        textAlign: 'right',
                      }}>{row[dataKey1]}</td>
                                    {dataKey2 && <td style={{
                        ...tdStyle,
                        textAlign: 'right',
                      }}>{row[dataKey2]}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
            </div>
        );
    };


    return (
        <div className="container mt-1">
            <h2 className="text-center mb-2">Monthwise Delivery Report</h2>
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="d-flex flex-wrap">
                        {months.map((month) => (
                            <button
                                key={month}
                                style={{ fontSize: '.60rem' }}
                                className={`btn btn-outline-primary m-1 ${selectedMonth === month ? 'active' : ''
                                    }`}
                                onClick={() => handleMonthClick(month)}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {selectedMonth && (
                <div className="row">
                    <div className="col-md-12 text-center mb-4">
                        <h6>Selected Month: {selectedMonth}</h6>
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.FPP,
                        `FPP Stage - ${selectedMonth || 'All Months'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_pages',
                        'Sum of Pages',
                        'No. of Titles',
                        'Pages'
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.Finals,
                        `Finals Stage - ${selectedMonth || 'All Months'}`,
                        'title_count',
                        'Number of Titles',
                        '',
                        '',
                        'No. of Titles',
                        ''
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.Revises,
                        `Revises-1 Stage - ${selectedMonth || 'All Months'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_corrections',
                        'Sum of Corrections',
                        'No. of Titles',
                        'Corrections'
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.OtherDeliveries,
                        `Other Deliveries Stage - ${selectedMonth || 'All Months'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_corrections',
                        'Sum of Corrections',
                        'No. of Titles',
                        'Corrections'
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthDelivery;