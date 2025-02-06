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
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import * as htmlToImage from 'html-to-image';
import mammoth from 'mammoth';

const ClientDelivery = () => {
  const componentRef = useRef(null);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(() => {
        return localStorage.getItem('selectedClient') || '';
    });
    const [chartsData, setChartsData] = useState({
        FPP: [],
        Finals: [],
        Revises: [],
        OtherDeliveries: [],
    });
     const [loading, setLoading] = useState(false);
    const [startMonth, setStartMonth] = useState(() => {
        const storedStartMonth = localStorage.getItem('selectedStartMonth');
        return storedStartMonth ? storedStartMonth : `${new Date().getFullYear()}-01`
    });
    const [endMonth, setEndMonth] = useState(() => {
          const storedEndMonth = localStorage.getItem('selectedEndMonth');
          return storedEndMonth ? storedEndMonth : `${new Date().getFullYear()}-12`;
    });
    const [years] = useState(() => {
         const currentYear = new Date().getFullYear();
        return [currentYear - 2, currentYear - 1, currentYear];
     });


    useEffect(() => {
        fetchClients();
        // Load data only if there's a selected client in local storage
        if (selectedClient) {
            fetchChartData(selectedClient);
        } else {
            fetchChartData(); // If no client stored load the all-client data
        }
    }, [selectedClient, startMonth, endMonth]);

  useEffect(() => {
      localStorage.setItem('selectedClient', selectedClient);
       localStorage.setItem('selectedStartMonth', startMonth);
       localStorage.setItem('selectedEndMonth', endMonth);
    }, [selectedClient,startMonth,endMonth]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/client-delivery-data-filters'
            );
            setClients(response.data.clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

     const fetchChartData = async (client = '') => {
        try {
            const fppResponse = await axios.get(
                'http://localhost:5000/client-delivery-data',
                { params: { client, startMonth, endMonth, stage: '01_FPP' } }
            );
            const finalsResponse = await axios.get(
                'http://localhost:5000/client-delivery-data',
                 { params: { client, startMonth, endMonth, stage: '03_Finals' } }
            );

            const revisesResponse = await axios.get(
                'http://localhost:5000/client-delivery-data',
                { params: { client, startMonth, endMonth, stage: '02_Revises-1' } }
            );

            const otherDeliveriesResponse = await axios.get(
                'http://localhost:5000/client-delivery-data',
                { params: { client, startMonth, endMonth, stage: '04_Other Deliveries' } }
            );

            setChartsData({
                FPP: fppResponse.data,
                Finals: finalsResponse.data,
                Revises: revisesResponse.data,
                OtherDeliveries: otherDeliveriesResponse.data,
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    const handleClientClick = (client) => {
        setSelectedClient(client);
    };

    const hexToRgba = (hex, opacity) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
    };
  const handleSubmit = (e) => {
        e.preventDefault();
          fetchChartData(selectedClient);
    };
   const renderMonthDropdown = (selectedMonth, setSelectedMonth, label) => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const selectedYear = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear();
        const selectedMon = selectedMonth ? selectedMonth.split('-')[1] : null;

        return (
            <div className="d-flex align-items-end mb-3">
                <div className="me-2">
                    <label className="form-label">{label} Month</label>
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
                <div>
                    <label className="form-label"> </label>
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
            </div>
        );
    }

    const generatePDF = async () => {
        setLoading(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            let yOffset = 10; // Initial Y offset for content

            // Add title
            pdf.setFontSize(18);
            pdf.text(`Clientwise Delivery Report - ${selectedClient || 'All Clients'}`, 15, yOffset);
            yOffset += 10;
            pdf.setFontSize(12);
            pdf.text(`Date: ${new Date().toLocaleDateString()}`, 15, yOffset);

            yOffset += 10;
            const captureAndAddImage = async (elementId, title, yOffsetValue, width, height) => {
                try {
                    const node = document.getElementById(elementId);
                    if (node) {
                        const dataUrl = await htmlToImage.toPng(node);
                        pdf.addImage(dataUrl, 'PNG', 10, yOffsetValue, width, height);
                        pdf.text(title, 15, yOffsetValue - 5);
                        return yOffsetValue + height + 10;
                    } else {
                        console.error(`Element with ID '${elementId}' not found`);
                        return yOffsetValue;
                    }
                } catch (error) {
                    console.error('Error capturing image:', error);
                    return yOffsetValue;
                }
            }
            yOffset = await captureAndAddImage('chart-fpp', 'FPP Chart', yOffset, 190, 100);
            if (yOffset > 250) {
                pdf.addPage();
                yOffset = 10;
            }
            yOffset = await captureAndAddImage('chart-finals', 'Finals Chart', yOffset, 190, 100);
            if (yOffset > 250) {
                pdf.addPage();
                yOffset = 10;
            }
            yOffset = await captureAndAddImage('chart-revises', 'Revises Chart', yOffset, 190, 100);
            if (yOffset > 250) {
                pdf.addPage();
                yOffset = 10;
            }
            yOffset = await captureAndAddImage('chart-other-deliveries', 'Other Deliveries Chart', yOffset, 190, 100);


            const fileName = `client_delivery_report_${selectedClient || 'all_clients'}.pdf`;
            pdf.save(fileName);
        }
        catch (error) {
            console.error('Error while generate pdf', error);
        }
        finally {
            setLoading(false);
        }
    };

    const generateWordDocument = async () => {
        setLoading(true);
        try {
            let htmlString = `<h1>Clientwise Delivery Report - ${selectedClient || 'All Clients'}</h1>`;
            htmlString += `<p>Date: ${new Date().toLocaleDateString()}</p>`;


            if (chartsData.FPP.length > 0) {
                htmlString += `<h2>FPP Stage</h2>`;
                htmlString += generateTableHTML(chartsData.FPP, 'Month', 'Number of Titles', 'Sum of Pages');
            }

            if (chartsData.Finals.length > 0) {
                htmlString += `<h2>Finals Stage</h2>`;
                htmlString += generateTableHTML(chartsData.Finals, 'Month', 'Number of Titles');
            }


            if (chartsData.Revises.length > 0) {
                htmlString += `<h2>Revises Stage</h2>`;
                htmlString += generateTableHTML(chartsData.Revises, 'Month', 'Number of Titles', 'Sum of Corrections');
            }


            if (chartsData.OtherDeliveries.length > 0) {
                htmlString += `<h2>Other Deliveries Stage</h2>`;
                htmlString += generateTableHTML(chartsData.OtherDeliveries, 'Month', 'Number of Titles', 'Sum of Corrections');
            }
            // using await with .convertToBuffer as it is async call
           const result = await mammoth.convertToBuffer({
                 html: htmlString,
            });
          const buffer = result.value;

            const fileName = `client_delivery_report_${selectedClient || 'all_clients'}.docx`;
            saveAs(new Blob([buffer]), fileName);
        } catch (error) {
            console.error('Error while generating word doc', error);
        }
        finally {
            setLoading(false);
        }
    };

    const generateTableHTML = (data, monthName, dataKey1Name, dataKey2Name) => {
        let tableHTML = `<table style="border-collapse: collapse; width:100%;">
        <thead>
           <tr style="border: 1px solid #ddd;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${monthName}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${dataKey1Name}</th>
                 ${dataKey2Name ? `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${dataKey2Name}</th>` : ""}
            </tr>
         </thead>
         <tbody>`;

        data.forEach((row, index) => {
            tableHTML += `<tr style="border: 1px solid #ddd; background-color: ${index % 2 === 0 ? 'transparent' : hexToRgba("#2a623d", 0.1)}">
            <td style="border: 1px solid #ddd; padding: 8px;">${row.month_sort}</td>
             <td style="border: 1px solid #ddd; padding: 8px;">${row.title_count}</td>
             ${dataKey2Name ? `<td style="border: 1px solid #ddd; padding: 8px;">${row.sum_pages || row.sum_corrections}</td>` : ''}
          </tr>`;
        });

        tableHTML += `</tbody></table>`;
        return tableHTML;
    }


    const renderChartWithTable = (
        data,
        title,
        dataKey1,
        name1,
        dataKey2,
        name2,
        yAxisLabel1,
        yAxisLabel2,
        chartId
    ) => {
        if (!data || data.length === 0) {
            return (
                <div className="col-12 mb-3 border bg-light p-3">
                    No data available for {title}
                </div>
            );
        }

        const maxValue1 = Math.max(...data.map((item) => Number(item[dataKey1])), 0);
        const yAxisMax1 = Math.ceil(maxValue1 * 1.2);

        const maxValue2 = Math.max(...data.map((item) => Number(item[dataKey2])), 0);
        const yAxisMax2 = Math.ceil(maxValue2 * 1.2);


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
            lineHeight: '1.4',
            whiteSpace: 'nowrap',

        };


        return (
            <div className="row mb-4"
                style={{ height: '400px' }}
                 >
                {/* Chart Section */}

                <div className="col-8 border lg-7 p-3 bg-light" id={chartId}>
                    <h5 className="text-center">{title}</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={data}
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
                            />
                            <XAxis
                                dataKey="month_sort"
                                label={{
                                    value: 'Month',
                                    position: 'insideBottom',
                                    offset: -40,
                                }}
                                angle={0}
                                textAnchor="end"
                                tickFormatter={(monthSort) => {
                                    const [year, month] = monthSort.split('-');
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    return `${monthNames[parseInt(month) - 1]}-${year}`;
                                 }}
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
                            <Tooltip />

                            <Bar
                                yAxisId="left"
                                dataKey={dataKey1}
                                fill={barColor1}
                                name={name1}
                            >
                                <LabelList dataKey={dataKey1} position="top" angle={-90} offset={15} />
                            </Bar>
                            {dataKey2 && (
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
                                <th style={thStyle}>Month</th>
                                <th style={thStyle}>{name1}</th>
                                {dataKey2 && <th style={thStyle}>{name2}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr
                                    key={index}
                                    style={{ backgroundColor: index % 2 === 0 ? 'transparent' : hexToRgba("#2a623d", 0.1) }}
                                >
                                    <td style={tdStyle}>{row.month_sort}</td>
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
            <h2 className="text-center mb-2">Clientwise Delivery Report</h2>

            {/* Client Buttons */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex flex-wrap justify-content-left">
                        {clients.map((client) => (
                            <button
                                key={client}
                                style={{ fontSize: '.75rem' }}
                                className={`btn btn-outline-primary m-1 ${selectedClient === client ? 'active' : ''
                                    }`}
                                onClick={() => handleClientClick(client)}
                            >
                                {client}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
{/* Selected Client */}
{selectedClient && (
                <div className="row">
                    <div className="col-12 text-center mb-4">
                        <h6>Selected Client: {selectedClient}</h6>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="row mb-3 align-items-end">
                   <div className="col-md-3">
                         {renderMonthDropdown(startMonth, setStartMonth, 'Start')}
                    </div>
                    <div className="col-md-3">
                        {renderMonthDropdown(endMonth, setEndMonth, 'End')}
                    </div>
                     <div className="col-md-3">
                            <button type="submit" className="btn btn-primary w-100">
                                Generate Report
                            </button>
                    </div>
                     <div className="col-md-3 d-flex justify-content-end">
                         {/* Export Buttons */}
                            <div className="d-flex">
                                <button
                                    className="btn btn-success m-1"
                                        onClick={generatePDF}
                                        disabled={loading}
                                    >
                                        {loading ? 'Generating PDF...' : 'Export PDF'}
                                </button>
                                <button
                                    className="btn btn-secondary m-1"
                                    onClick={generateWordDocument}
                                    disabled={loading}
                                >
                                    {loading ? 'Generating Word...' : 'Export Word'}
                                </button>
                            </div>
                      </div>
                </div>
            </form>


            {/* Chart and Table Sections */}
            <div className="row">
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.FPP,
                        `FPP Stage - ${selectedClient || 'All Clients'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_pages',
                        'Sum of Pages',
                        'No. of Titles',
                        'Pages',
                         'chart-fpp'
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.Finals,
                        `Finals Stage - ${selectedClient || 'All Clients'}`,
                        'title_count',
                        'Number of Titles',
                        '',
                        '',
                        'No. of Titles',
                        '',
                        'chart-finals'
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.Revises,
                        `Revises-1 Stage - ${selectedClient || 'All Clients'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_corrections',
                        'Sum of Corrections',
                        'No. of Titles',
                        'Corrections',
                        'chart-revises'
                    )}
                </div>
                <div className="col-12">
                    {renderChartWithTable(
                        chartsData.OtherDeliveries,
                        `Other Deliveries Stage - ${selectedClient || 'All Clients'}`,
                        'title_count',
                        'Number of Titles',
                        'sum_corrections',
                        'Sum of Corrections',
                        'No. of Titles',
                        'Corrections',
                         'chart-other-deliveries'
                    )}
                </div>
            </div>
        </div>
    );

};

export default ClientDelivery;