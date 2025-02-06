import { useState, useEffect, useRef } from 'react';
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

const MonthDelivery = () => {
    const componentRef = useRef(null);
    const [chartsData, setChartsData] = useState({
        FPP: [],
        Finals: [],
        Revises: [],
        OtherDeliveries: [],
    });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const storedMonth = localStorage.getItem('selectedMonth');
        return storedMonth ? storedMonth : `${new Date().getFullYear()}-01`;
    });
    const [years] = useState(() => {
         const currentYear = new Date().getFullYear();
        return [currentYear - 2, currentYear - 1, currentYear];
     });


    useEffect(() => {
         fetchChartData(selectedMonth);
    }, [selectedMonth]);


     useEffect(() => {
        localStorage.setItem('selectedMonth', selectedMonth);
    }, [selectedMonth]);


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
            setChartsData({
                FPP: [],
                Finals: [],
                Revises: [],
                OtherDeliveries: [],
            });
        }
    };


    const hexToRgba = (hex, opacity) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
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

        // Dynamically calculate chart height based on data length (minimum 300)
        // const chartHeight = Math.max(300, sortedData.length * 30);  //Adjust 30 if necessary

        return (
             <div className="row mb-4"
                style={{ height: '400px' }}>
                {/* Chart Section */}
                <div className="col-8 border p-3 bg-light">
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
                <div className="col-4 border p-3 bg-light" style={{ overflow: 'auto', maxHeight: '400px' }}>
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
        <div className="container mt-1" ref={componentRef}>
            <h2 className="text-center mb-2">Monthwise Delivery Report</h2>
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