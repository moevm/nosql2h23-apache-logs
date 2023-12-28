import React from 'react';
import './Dashboard.css';

// Date picker
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// Data Grid
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useDemoData } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';

// Measurement picker
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// Papaparse
import { usePapaParse } from 'react-papaparse';


// ----------------------Dashboard---------------------


export default function Dashboard() {
  // Date picker
  const [from, setFrom] = React.useState(dayjs().subtract(1, 'day'));
  const [to, setTo] = React.useState(dayjs());
  const handleFromChange = (newValue) => {
    setFrom(newValue);
  };
  const handleToChange = (newValue) => {
    setTo(newValue);
  };

  // Measurement picker
  const [measure, setMeasure] = React.useState('access');

  const handleMeasureChange = (event) => {
    setMeasure(event.target.value);
  };

  // Data grid
  // const { data } = useDemoData({
  //   dataSet: 'Commodity',
  //   rowLength: 100,
  //   editable: false,
  // });
  const [data, setData] = React.useState({ columns: [], rows: [] });

  // Papa parse
  const { readString } = usePapaParse();


  // Query data

  const query = () => {
    const bod = { measurement: measure, start: from.toISOString(), stop: to.toISOString() };
    fetch('http://localhost:4000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bod)
    })
      .then(res => {
        res.json().then(data => {
          readString(data.query, {
            worker: true,
            header: true,
            complete: (results) => {
              console.log('---------------------------');
              console.log(results);
              console.log('---------------------------');
              results.data.forEach((el, i) => {
                el.id = i;
              });

              let columns = [];
              results.meta.fields.forEach(el => {
                let col = {
                  field: el,
                  headerName: el,
                  width: 150
                };
                columns.push(col);
              });
              setData({ columns: columns, rows: results.data });
            },
          });
        })
      })
  }

  //----------------JSX----------------- 

  return (
    <div className='Dashboard'>
      <h2>Apache logs</h2>
      <div className='header'>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="From"
            value={from}
            onChange={handleFromChange}
            sx={{
              svg: { color: '#AFBCD0' },
              input: { color: '#AFBCD0', },
              label: { color: '#AFBCD0' }
            }}
          />
          <DateTimePicker
            label="To"
            value={to}
            onChange={handleToChange}
            sx={{
              svg: { color: '#AFBCD0' },
              input: { color: '#AFBCD0' },
              label: { color: '#AFBCD0' }
            }}
          />
        </LocalizationProvider>
        {/* <button>Export to CSV</button> */}
        {/* <button>Import CSV</button> */}
        <FormControl className='frmcntrl'>
          <InputLabel id="demo-simple-select-label"
            sx={{
              backgroundColor: '#181B1F',
              color: '#AFBCD0'
            }}>Log type</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={measure}
            label="Age"
            onChange={handleMeasureChange}
            sx={{
              backgroundColor: '#181B1F',
              color: '#AFBCD0',
              svg: { color: '#AFBCD0' },
              input: { color: '#AFBCD0' },
              label: { color: '#AFBCD0' }
            }}
          >
            <MenuItem value={'access'}>Access</MenuItem>
            <MenuItem value={'error'}>Error</MenuItem>
          </Select>
        </FormControl>
        <button onClick={() => query()}>Query</button>
      </div>
      <Box sx={{ height: '80vh', width: '100%' }}>
        <DataGridPro
          columns={data.columns}
          rows={data.rows}
          loading={data.rows.length === 0}
          rowHeight={38}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            backgroundColor: '#181B1F',
            svg: { color: '#AFBCD0' },
            color: '#AFBCD0'
          }}
        />
      </Box>
    </div>
  );
}