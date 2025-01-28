import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const QMRS = () => {
    const [data, setData] = useState({ monthWiseData: {}, functionWiseData: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('external');
    const [activeYear, setActiveYear] = useState('');
    const [expandedPublishers, setExpandedPublishers] = useState({});
    const [expandedFunctions, setExpandedFunctions] = useState({}); // State for function expansion


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/QMRS');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const jsonData = await response.json();
                setData(jsonData);
                setActiveYear(Object.keys(jsonData.monthWiseData)[0] || '');
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const monthOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

    const togglePublisherExpand = (publisher) => {
        setExpandedPublishers((prev) => ({
            ...prev,
            [publisher]: !prev[publisher],
        }));
    };

      const toggleFunctionExpand = (functionName) => {
        setExpandedFunctions((prev) => ({
            ...prev,
            [functionName]: !prev[functionName],
        }));
    };

    const renderMonthWiseTable = (yearData) => {
        const rows = Object.entries(yearData).map(([publisher, publisherData]) => {
            const functions = publisherData.functions || {};

            let publisherGrandTotal = 0;
            monthOrder.forEach((month) => {
                 if (activeTab === 'internal') {
                      publisherGrandTotal += Object.values(functions).reduce((sum, funcData) => {
                        return sum + (funcData[month] ? Number(funcData[month]) : 0);
                    }, 0);
                  } else {
                      publisherGrandTotal += Object.values(functions).reduce((sum, funcData) => {
                        return sum + (funcData[month] ? Number(funcData[month]) : 0);
                    }, 0);
                  }
            })

            return {
                publisher,
                publisherGrandTotal,
                functions,
            };
        });

        rows.sort((a, b) => b.publisherGrandTotal - a.publisherGrandTotal);

        return rows.map(({ publisher, publisherGrandTotal, functions }) => {
            const isExpanded = expandedPublishers[publisher];

            return (
                <React.Fragment key={publisher}>
                    <tr onClick={() => togglePublisherExpand(publisher)} style={{ cursor: 'pointer' }}>
                        <td>{isExpanded ? '▼' : '▶'} {publisher}</td>
                        <td colSpan={monthOrder.length + 1}>{isExpanded ? '' : publisherGrandTotal}</td>
                    </tr>
                    {isExpanded &&
                        Object.entries(functions).map(([functionName, functionData]) => {
                            let functionGrandTotal = 0;

                            const functionMonthWiseTotals = monthOrder.map((month) => {
                                const count = functionData[month] || 0;
                                const validCount = Number(count) || 0;

                                functionGrandTotal += validCount;
                                return validCount;
                            });

                            return (
                                <tr key={`${publisher}-${functionName}`}>
                                    <td></td>
                                    <td>{functionName}</td>
                                    {functionMonthWiseTotals.map((count, index) => (
                                        <td key={index}>{count || ''}</td>
                                    ))}
                                    <td>{functionGrandTotal}</td>
                                </tr>
                            );
                        })}
                </React.Fragment>
            );
        });
    };

    const renderFunctionWiseTable = (yearData) => {
      const rows = Object.entries(yearData).map(([functionName, functionData]) => {
          let functionGrandTotal = 0;
  
          const publishers = Object.entries(functionData).map(([publisher, publisherData]) => {
              let publisherGrandTotal = 0;
              monthOrder.forEach((month) => {
                   if (activeTab === 'internal') {
                      publisherGrandTotal += publisherData[month] ? Number(publisherData[month]) : 0;
                    } else {
                       publisherGrandTotal += publisherData[month] ? Number(publisherData[month]) : 0;
                    }
              })
  
              functionGrandTotal += publisherGrandTotal;
  
              return {
                  publisher,
                  publisherGrandTotal,
                  publisherData
              };
          });
  
          publishers.sort((a, b) => b.publisherGrandTotal - a.publisherGrandTotal);
  
          return {
              functionName,
              functionGrandTotal,
              publishers,
          };
      });
  
      rows.sort((a, b) => b.functionGrandTotal - a.functionGrandTotal);
  
        return rows.map(({ functionName, functionGrandTotal, publishers }) => {
            const isExpanded = expandedFunctions[functionName];
            return (
               <React.Fragment key={functionName}>
                     <tr onClick={() => toggleFunctionExpand(functionName)} style={{ cursor: 'pointer' }}>
                        <td colSpan={monthOrder.length + 2} className="bg-light">
                          <strong>{isExpanded ? '▼' : '▶'} {functionName} (Total: {functionGrandTotal})</strong>
                        </td>
                    </tr>
                  {isExpanded &&
                      publishers.map(({ publisher, publisherGrandTotal, publisherData }) => {
                        const monthWiseTotals = monthOrder.map((month) => {
                             if (activeTab === 'internal') {
                               return  publisherData[month] ? Number(publisherData[month]) : 0;
                             } else {
                                return  publisherData[month] ? Number(publisherData[month]) : 0;
                             }
                       })
                      return (
                          <tr key={`${functionName}-${publisher}`}>
                              <td></td>
                              <td>{publisher}</td>
                              {monthWiseTotals.map((count, index) => (
                                    <td key={index}>{count || ''}</td>
                                ))}
                              <td>{publisherGrandTotal}</td>
                          </tr>
                        )
                    })}
              </React.Fragment>
              );
        });
    };

    const renderYearTabs = () =>
        Object.keys(data.monthWiseData).map((year) => (
            <li className="nav-item" key={year}>
                <button
                    className={`nav-link ${activeYear === year ? 'active' : ''}`}
                    onClick={() => setActiveYear(year)}
                >
                    {year}
                </button>
            </li>
        ));


    return (
        <div className="container">
            <h1 className="my-4">QMRS Reports</h1>
            <ul className="nav nav-tabs">
                {renderYearTabs()}
            </ul>
            {activeYear && (
                <div>
                    <ul className="nav nav-tabs mt-3">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'external' ? 'active' : ''}`}
                                onClick={() => setActiveTab('external')}
                            >
                                External Feedback
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'internal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('internal')}
                            >
                                Internal Feedback
                            </button>
                        </li>
                    </ul>
                    <table className="table table-striped table-hover table-bordered mt-3">
                        <thead className="table-primary">
                            <tr>
                                <th>Publisher</th>
                                <th>Function</th>
                                {monthOrder.map((month) => (
                                    <th key={month}>{month}</th>
                                ))}
                                <th>Grand Total</th>
                            </tr>
                        </thead>
                        <tbody>{renderMonthWiseTable(data.monthWiseData[activeYear])}</tbody>
                    </table>

                    <table className="table table-striped table-hover table-bordered mt-3">
                        <thead className="table-secondary">
                            <tr>
                                <th>Function</th>
                                <th>Publisher</th>
                                {monthOrder.map((month) => (
                                    <th key={month}>{month}</th>
                                ))}
                                <th>Grand Total</th>
                            </tr>
                        </thead>
                        <tbody>{renderFunctionWiseTable(data.functionWiseData[activeYear])}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default QMRS;