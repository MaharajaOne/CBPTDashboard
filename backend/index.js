const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cbpt',
  password: 'admin',
  port: 5432,
});

const SECRET_KEY = 'Maharaja';

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Login endpoint
app.post('/login', async (req, res) => {
    const { emp_id, password } = req.body;
  
    try {
      const userQuery = await pool.query('SELECT * FROM employee WHERE emp_id = $1', [emp_id]);
      const user = userQuery.rows[0];
  
      if (!user) {
        console.log('User not found for emp_id:', emp_id); // Debug log
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (password !== user.password) {
        console.log('Invalid password for emp_id:', emp_id); // Debug log
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ emp_id: user.emp_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
      console.log('Login successful for emp_id:', emp_id); // Debug log
      res.json({ token });
    } catch (err) {
      console.error('Error during login:', err); // Debug log
      res.status(500).json({ message: 'Error logging in', error: err });
    }
  });
  
// Middleware for token verification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Role-based access
app.get('/sidebar', authenticate, (req, res) => {
  const { role } = req.user;

  const sidebar = {
    admin: ['Home', 'Time Sheet', 'Monthly Report', 'Title Statistics', 'Customers'],
    user: ['Home', 'Time Sheet'],
  };

  res.json({ sidebar: sidebar[role] || [] });
});

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));


app.get('/employee-details', authenticate, async (req, res) => {
  try {
    const { emp_id } = req.user;
    const result = await pool.query('SELECT emp_id, emp_name, role FROM employee WHERE emp_id = $1', [emp_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ name: result.rows[0].emp_name, role: result.rows[0].role, emp_id: result.rows[0].emp_id });
  } catch (err) {
    console.error('Error fetching employee details:', err);
    res.status(500).json({ message: 'Failed to fetch employee details', error: err });
  }
});


//Client wise Monthly delivery data
app.get('/client-delivery-data', async (req, res) => {
  const { client, month, stage } = req.query;

  let query = `
      SELECT 
          Client, 
          CASE 
              WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
              WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
              WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
              WHEN Stage IN ('DB', 'Sample', 'Refinals', 'CP', 'Revises 2', 'Epub correx', 'Revises 3', 
                             'FP PM correx', 'Revises 4', 'Index', 'Recastoff', 'Revises 5', 
                             'Revises 6', 'Revises 7', 'Revises 8', 'Revises 9', '11_Vouchers', 
                             '04_Revises II', '06_Index', '02_FP_PM_Corrections', '09_Scatters I', 
                             '07_Tables', '25_Revised Index', '11_Rev Vouchers', '08_PM_Corrections', 
                             '13_Re-finals', '05_Revises III', '16_Other', '06_Revises IV', 
                             'Voucher Correcs', 'Index Correcs', 'Rev Correcs', 'FP_PM correcs', 
                             'Rev II', 'Vouchers', 'Appendix', 'Reprint', '03_Re-Finals', 
                             '02_Final correcs', '15_WEBPDF', '00_FM & RWS', '26_Rev. WebPDF') 
              THEN '04_Other Deliveries'
              ELSE '04_Other Deliveries'
          END AS normalized_stage,
          COUNT(DISTINCT Ititle) AS title_count,
          SUM(CASE WHEN Pages ~ '^[0-9]+$' THEN CAST(Pages AS NUMERIC) ELSE 0 END) AS sum_pages, 
          SUM(CASE WHEN Corrections ~ '^[0-9]+$' THEN CAST(Corrections AS NUMERIC) ELSE 0 END) AS sum_corrections,
           TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
          TO_CHAR(delivered_date, 'MON') AS month
      FROM MonthlyReport
      WHERE 1 = 1
  `;

  const params = [];

  if (client) {
      query += ` AND Client = $${params.length + 1}`;
      params.push(client);
  }

  if (month) {
       query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
       params.push(month);
  }

  if (stage) {
      query += ` AND CASE 
                    WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                    WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                    WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                    ELSE '04_Other Deliveries'
                END = $${params.length + 1}`;
      params.push(stage);
  }

  query += ` GROUP BY Client, normalized_stage, month_sort, month ORDER BY month_sort`;

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
//Client wise Monthly delivery data
app.get('/client-delivery-data-filters', async (req, res) => {
  try {
      const query = `
          SELECT DISTINCT Client, 
                          TO_CHAR(delivered_date, 'MON') AS month,
                          CASE 
                              WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                              WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                              WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                              ELSE '04_Other Deliveries'
                          END AS normalized_stage
          FROM MonthlyReport;
      `;

      const result = await pool.query(query);

      const filters = {
          clients: [...new Set(result.rows.map(row => row.client))],
          months: [...new Set(result.rows.map(row => row.month))],
          stages: [...new Set(result.rows.map(row => row.normalized_stage))],
      };

      res.json(filters);
  } catch (error) {
      console.error('Error fetching filters:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

//Month wise Monthly delivery data
app.get('/month-delivery-data', async (req, res) => {
  const { client, month, stage } = req.query;

  let query = `
      SELECT 
          Client, 
          CASE 
              WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
              WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
              WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
              WHEN Stage IN ('DB', 'Sample', 'Refinals', 'CP', 'Revises 2', 'Epub correx', 'Revises 3', 
                             'FP PM correx', 'Revises 4', 'Index', 'Recastoff', 'Revises 5', 
                             'Revises 6', 'Revises 7', 'Revises 8', 'Revises 9', '11_Vouchers', 
                             '04_Revises II', '06_Index', '02_FP_PM_Corrections', '09_Scatters I', 
                             '07_Tables', '25_Revised Index', '11_Rev Vouchers', '08_PM_Corrections', 
                             '13_Re-finals', '05_Revises III', '16_Other', '06_Revises IV', 
                             'Voucher Correcs', 'Index Correcs', 'Rev Correcs', 'FP_PM correcs', 
                             'Rev II', 'Vouchers', 'Appendix', 'Reprint', '03_Re-Finals', 
                             '02_Final correcs', '15_WEBPDF', '00_FM & RWS', '26_Rev. WebPDF') 
              THEN '04_Other Deliveries'
              ELSE '04_Other Deliveries'
          END AS normalized_stage,
          COUNT(DISTINCT Ititle) AS title_count,
          SUM(CASE WHEN Pages ~ '^[0-9]+$' THEN CAST(Pages AS NUMERIC) ELSE 0 END) AS sum_pages, 
          SUM(CASE WHEN Corrections ~ '^[0-9]+$' THEN CAST(Corrections AS NUMERIC) ELSE 0 END) AS sum_corrections,
           TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
          TO_CHAR(delivered_date, 'MON') AS month
      FROM MonthlyReport
      WHERE 1 = 1
  `;

  const params = [];

  if (client) {
      query += ` AND Client = $${params.length + 1}`;
      params.push(client);
  }

  if (month) {
       query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
       params.push(month);
  }

  if (stage) {
      query += ` AND CASE 
                    WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                    WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                    WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                    ELSE '04_Other Deliveries'
                END = $${params.length + 1}`;
      params.push(stage);
  }

  query += ` GROUP BY Client, normalized_stage, month_sort, month ORDER BY month_sort`;

  try {
      const result = await pool.query(query, params);
      res.json(result.rows);
  } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
//Month wise Monthly delivery data
app.get('/month-delivery-data-filters', async (req, res) => {
    try {
      const query = `
          SELECT DISTINCT 
              TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
              TO_CHAR(delivered_date, 'MON') AS month,
               CASE 
                              WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                              WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                              WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                              ELSE '04_Other Deliveries'
                          END AS normalized_stage
          FROM MonthlyReport
           ORDER BY month_sort
      `;
  
      const result = await pool.query(query);
  
      const filters = {
           
           months: [...new Map(result.rows.map(item => [item.month, item])).values()].map(row => row.month),
          stages: [...new Set(result.rows.map(row => row.normalized_stage))],
      };
      res.json(filters);
    } catch (error) {
      console.error('Error fetching filters:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

//Clientwise Ontime Data
  app.get('/client-ontime-data', async (req, res) => {
    const { client, month, stage } = req.query;
  
      let query = `
          SELECT
              Client,
              CASE
                  WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                  WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                  WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                  WHEN Stage IN ('DB', 'Sample', 'Refinals', 'CP', 'Revises 2', 'Epub correx', 'Revises 3',
                                  'FP PM correx', 'Revises 4', 'Index', 'Recastoff', 'Revises 5',
                                  'Revises 6', 'Revises 7', 'Revises 8', 'Revises 9', '11_Vouchers',
                                  '04_Revises II', '06_Index', '02_FP_PM_Corrections', '09_Scatters I',
                                  '07_Tables', '25_Revised Index', '11_Rev Vouchers', '08_PM_Corrections',
                                  '13_Re-finals', '05_Revises III', '16_Other', '06_Revises IV',
                                  'Voucher Correcs', 'Index Correcs', 'Rev Correcs', 'FP_PM correcs',
                                  'Rev II', 'Vouchers', 'Appendix', 'Reprint', '03_Re-Finals',
                                  '02_Final correcs', '15_WEBPDF', '00_FM & RWS', '26_Rev. WebPDF')
                  THEN '04_Other Deliveries'
                  ELSE '04_Other Deliveries'
              END AS normalized_stage,
              TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
              TO_CHAR(delivered_date, 'MON') AS month,
             delivered_date,
              actual_date,
             proposed_date,
              Ititle
          FROM MonthlyReport
          WHERE 1 = 1
      `;
  
  
    const params = [];
  
    if (client) {
      query += ` AND Client = $${params.length + 1}`;
      params.push(client);
    }
  
    if (month) {
      query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
      params.push(month);
    }
  
    if (stage) {
        query += ` AND CASE
                      WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                      WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                      WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                      ELSE '04_Other Deliveries'
                  END = $${params.length + 1}`;
        params.push(stage);
    }
  
    query += ` ORDER BY month_sort`;
  
    try {
      const result = await pool.query(query, params);
  
      const processedRows = result.rows.map(row => {
          const deliveredDate = new Date(row.delivered_date);
          const actualDate = new Date(row.actual_date);
          const proposedDate = new Date(row.proposed_date);
  
          let status;
  
          if (deliveredDate <= actualDate) {
              status = "Instances that met original date";
          } else if (deliveredDate <= proposedDate) {
              status = "met revised date";
          }else {
              status = "delivered late";
          }
            return {
                ...row,
                status,
            };
  
      });
  
       const groupedData = processedRows.reduce((acc, row) => {
            const key = `${row.Client}-${row.normalized_stage}-${row.month_sort}-${row.month}`;
  
             if (!acc[key]) {
                 acc[key] = {
                     Client: row.Client,
                     normalized_stage: row.normalized_stage,
                     month_sort: row.month_sort,
                     month: row.month,
                     late_titles: 0,
                     met_revised_titles: 0,
                     met_original_titles:0
                 };
             }
  
              if(row.status ==="Instances that met original date"){
                  acc[key].met_original_titles++;
              } else if (row.status === "met revised date") {
                  acc[key].met_revised_titles++;
              }
              else{
                  acc[key].late_titles++;
              }
  
  
          return acc;
       }, {});
  
       const finalResult = Object.values(groupedData);
  
      res.json(finalResult);
  
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  //Clientwise Ontime Data
  app.get('/client-ontime-data-filters', async (req, res) => {
      try {
          const query = `
              SELECT DISTINCT Client,
                              TO_CHAR(delivered_date, 'MON') AS month,
                              CASE
                                  WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                                  WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                                  WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                                  ELSE '04_Other Deliveries'
                              END AS normalized_stage
              FROM MonthlyReport;
          `;
  
          const result = await pool.query(query);
  
          const filters = {
              clients: [...new Set(result.rows.map(row => row.client))],
              months: [...new Set(result.rows.map(row => row.month))],
              stages: [...new Set(result.rows.map(row => row.normalized_stage))],
          };
  
          res.json(filters);
      } catch (error) {
          console.error('Error fetching filters:', error);
          res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
  });
  
//Monthwise Ontime Data
  app.get('/month-ontime-data', async (req, res) => {
    const { client, month, stage } = req.query;
  
    let query = `
        SELECT
            Client,
            CASE
                WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                ELSE '04_Other Deliveries'
            END AS normalized_stage,
            TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
            COUNT(CASE WHEN delivered_date <= actual_date THEN 1 END) AS met_original_titles,
            COUNT(CASE WHEN delivered_date > actual_date AND delivered_date <= proposed_date THEN 1 END) AS met_revised_titles,
            COUNT(CASE WHEN delivered_date > proposed_date THEN 1 END) AS late_titles
        FROM MonthlyReport
        WHERE 1 = 1
    `;
  
    const params = [];
  
    if (client) {
      query += ` AND Client = $${params.length + 1}`;
      params.push(client);
    }
  
    if (month) {
      query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
      params.push(month.toUpperCase());
    }
  
    if (stage) {
      query += ` AND CASE
                    WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                    WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                    WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                    ELSE '04_Other Deliveries'
                END = $${params.length + 1}`;
      params.push(stage);
    }
  
    query += ` GROUP BY Client, normalized_stage, month_sort ORDER BY Client, month_sort`;
  
    try {
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  //Monthwise Ontime Data
  app.get('/month-ontime-data-filters', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT 
                TO_CHAR(delivered_date, 'YYYY-MM') AS month_sort,
                TO_CHAR(delivered_date, 'MON') AS month,
                CASE 
                    WHEN Stage IN ('FP', '01_FPP', 'FPP') THEN '01_FPP'
                    WHEN Stage IN ('Finals', '12_Final', '01_Finals') THEN '03_Finals'
                    WHEN Stage IN ('Revises', '03_Revises I', 'Rev I', 'Revises 1', 'Revises I') THEN '02_Revises-1'
                    ELSE '04_Other Deliveries'
                END AS normalized_stage
            FROM MonthlyReport
            GROUP BY month_sort, month, normalized_stage
            ORDER BY month_sort
        `;
    
        const result = await pool.query(query);
    
        const filters = {
            months: [...new Map(result.rows.map(item => [item.month, item])).values()].map(row => row.month),
            stages: [...new Set(result.rows.map(row => row.normalized_stage))],
        };
        
        res.json(filters);
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//Getting the QMRS data 
app.get('/QMRS', async (req, res) => {
  try {
      const client = await pool.connect();

      // Query to get month-wise feedback count grouped by publisher, function, and feedback_type
    const monthWisePublisherFunctionQuery = `
    SELECT
        function,
        publisher,
        month_year AS month_year,
        COUNT(DISTINCT feedbackid) AS feedback_count,
        CASE WHEN type = 'Internal' THEN 'internal' ELSE 'external' END as feedback_type
    FROM
        QMRS
    GROUP BY
        function, publisher, month_year, feedback_type
    ORDER BY
        function, publisher, month_year;
    `;

    // Query to get function-wise feedback count grouped by publisher
      const functionWisePublisherQuery = `
    SELECT
      function,
      publisher,
      month_year,
      COUNT(DISTINCT feedbackid) AS feedback_count
    FROM
        QMRS
    GROUP BY
      function, publisher, month_year
    ORDER BY
        function, publisher, month_year;
    `;


      const monthWisePublisherFunctionResult = await client.query(monthWisePublisherFunctionQuery);
      const functionWisePublisherResult = await client.query(functionWisePublisherQuery);

      // Format data for the first table
      const formattedMonthWiseData = {};
      monthWisePublisherFunctionResult.rows.forEach(row => {
          const { function: functionName, publisher, month_year, feedback_count, feedback_type } = row;

           const [month, year] = month_year.split('-'); // Split 'Mon-YYYY'
          const formattedYear = year.length === 4 ? year : `20${year}`; // Ensure four-digit year format

          if (!formattedMonthWiseData[formattedYear]) {
              formattedMonthWiseData[formattedYear] = {};
          }
          if (!formattedMonthWiseData[formattedYear][publisher]) {
              formattedMonthWiseData[formattedYear][publisher] = { functions: {}, internal: {}, external: {} };
          }
           if (!formattedMonthWiseData[formattedYear][publisher].functions[functionName]) {
              formattedMonthWiseData[formattedYear][publisher].functions[functionName] = {};
          }


          formattedMonthWiseData[formattedYear][publisher][feedback_type][month] = feedback_count;
           formattedMonthWiseData[formattedYear][publisher].functions[functionName][month] = feedback_count;



      });

       // Format data for the second table
       const formattedFunctionWiseData = {};
      functionWisePublisherResult.rows.forEach(row => {
          const { function: functionName, publisher, month_year, feedback_count } = row;

          const [month, year] = month_year.split('-');
          const formattedYear = year.length === 4 ? year : `20${year}`; // Ensure four-digit year format

           if (!formattedFunctionWiseData[formattedYear]) {
              formattedFunctionWiseData[formattedYear] = {};
          }
          if (!formattedFunctionWiseData[formattedYear][functionName]) {
              formattedFunctionWiseData[formattedYear][functionName] = {};
          }
          if (!formattedFunctionWiseData[formattedYear][functionName][publisher]) {
              formattedFunctionWiseData[formattedYear][functionName][publisher] = {};
          }
          formattedFunctionWiseData[formattedYear][functionName][publisher][month] = feedback_count;
      });


      client.release();
      res.json({
          monthWiseData: formattedMonthWiseData,
          functionWiseData: formattedFunctionWiseData,
      });
  } catch (error) {
      console.error('Error fetching QMRS data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});

//Title Statistics Client Dropdown
app.get('/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT client FROM monthlyreport');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

//Title Statistics ititle Dropdown
app.get('/ititles/:client', async (req, res) => {
  const client = req.params.client;
  try {
    const result = await pool.query('SELECT DISTINCT ititle FROM monthlyreport WHERE client = $1', [client]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

//Title Statistics report
app.get('/monthlyreport', async (req, res) => {
  const { client, ititle, month } = req.query;
  console.log("monthlyreport req.query",req.query)


    let query = `
        SELECT 
            client, division, ititle, stage, pages, corrections, 
            TO_CHAR(received_date, 'YYYY-MM-DD') AS received_date, 
            TO_CHAR(actual_date, 'YYYY-MM-DD') AS actual_date, 
            TO_CHAR(proposed_date, 'YYYY-MM-DD') AS proposed_date, 
            TO_CHAR(delivered_date, 'YYYY-MM-DD') AS delivered_date,
             (
                SELECT COUNT(day)
                FROM   generate_series(received_date::date, delivered_date::date, '1 day'::interval) day
                WHERE  EXTRACT(DOW FROM day) <> 0
            ) AS working_days
        FROM monthlyreport
         WHERE 1=1
    `;

    const params = [];

    if (client) {
        query += ` AND Client = $${params.length + 1}`;
        params.push(client);
    }

     if (month) {
        query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
        params.push(month);
    }

    if (ititle) {
        query += ` AND Ititle = $${params.length + 1}`;
        params.push(ititle);
    }

    console.log("query", query);
    console.log("params", params);

  try {
        const result = await pool.query(query, params);
      console.log("result.rows", result.rows)
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.get('/fp-delivery-report', async (req, res) => {
  const { client, month } = req.query;
  console.log("/fp-delivery-report req.query", req.query);

  let query = `
      SELECT
          CASE
              WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
              WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
              WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
              WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
              WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
              WHEN subquery.avg_working_days > 21 THEN '>21'
              ELSE 'Unknown'
          END AS working_days_category,
           COUNT(DISTINCT subquery.Ititle) AS fp_title_count,
          TO_CHAR(subquery.delivered_date, 'MON') AS month,
          subquery.Client AS client
      FROM (
          SELECT
               (
                  SELECT COUNT(day) -1
                  FROM   generate_series(received_date::date, delivered_date::date, '1 day'::interval) day
                  WHERE  EXTRACT(DOW FROM day) <> 0
              )  AS avg_working_days,
              delivered_date,
              Client,
              Stage,
              Ititle,
              received_date
          FROM MonthlyReport
          WHERE 1=1
      `;

  const params = [];

  if (client) {
      query += ` AND Client = $${params.length + 1}`;
      params.push(client);
  }

  if (month) {
      query += ` AND TO_CHAR(delivered_date, 'MON') = $${params.length + 1}`;
      params.push(month);
  }

  query += `   ) AS subquery
      WHERE  subquery.Stage IN ('FP', '01_FPP', 'FPP')
      GROUP BY  working_days_category,TO_CHAR(subquery.delivered_date, 'MON'), subquery.Client
      ORDER BY
          CASE
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '0-5' THEN 1
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '6-7' THEN 2
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '8-10' THEN 3
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '11-14' THEN 4
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '15-21' THEN 5
              WHEN  CASE
                      WHEN subquery.avg_working_days >= 0 AND subquery.avg_working_days <= 5 THEN '0-5'
                      WHEN subquery.avg_working_days >= 6 AND subquery.avg_working_days <= 7 THEN '6-7'
                      WHEN subquery.avg_working_days >= 8 AND subquery.avg_working_days <= 10 THEN '8-10'
                      WHEN subquery.avg_working_days >= 11 AND subquery.avg_working_days <= 14 THEN '11-14'
                      WHEN subquery.avg_working_days >= 15 AND subquery.avg_working_days <= 21 THEN '15-21'
                      WHEN subquery.avg_working_days > 21 THEN '>21'
                      ELSE 'Unknown'
                  END = '>21' THEN 6
              ELSE 7
          END
      `;
  console.log("query", query);
  console.log("params", params);

  try {
      const result = await pool.query(query, params);
      console.log("result.rows", result.rows);
      res.json(result.rows);
  } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});