import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useTable } from "react-table";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Box } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchDataForDate = async (date) => {
    try {
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const collectionRef = collection(db, "clockInOut");
      const q = query(
        collectionRef,
        where("clockInTime", ">=", startOfDay.toISOString()),
        where("clockInTime", "<=", endOfDay.toISOString())
      );
      const querySnapshot = await getDocs(q);
      const dataArray = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        const clockInTime = new Date(docData.clockInTime);
        const clockOutTime = new Date(docData.clockOutTime);
        const hoursWorked = ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2);

        return {
          id: doc.id,
          ...docData,
          clockInDate: clockInTime.toLocaleDateString(),
          clockInTime: clockInTime.toLocaleTimeString(),
          clockOutDate: clockOutTime.toLocaleDateString(),
          clockOutTime: clockOutTime.toLocaleTimeString(),
          hoursWorked: hoursWorked,
        };
      });
      setData(dataArray);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchDataForDate(new Date());
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchDataForDate(date);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "User ID",
        accessor: "userId",
      },
      {
        Header: "Clock In Date",
        accessor: "clockInDate",
      },
      {
        Header: "Clock In Time",
        accessor: "clockInTime",
      },
      {
        Header: "Clock Out Date",
        accessor: "clockOutDate",
      },
      {
        Header: "Clock Out Time",
        accessor: "clockOutTime",
      },
      {
        Header: "Hours Worked",
        accessor: "hoursWorked",
      },
      {
        Header: "Latitude",
        accessor: "location.latitude",
      },
      {
        Header: "Longitude",
        accessor: "location.longitude",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <br />
      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: "bold" }}>
        Employee Clock-In/Clock-Out Dashboard
      </Typography>

      <br />
      <Box display="flex" justifyContent="center" mb={3}>
      <div>
      <Typography variant="h6" style={{ fontWeight: "bold" }}>
        Select Date
      </Typography>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          customInput={<TextField />}
        />
      </div>
      </Box>
      
      <br />
      <TableContainer component={Paper}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableCell
                    {...column.getHeaderProps()}
                    style={{ fontWeight: "bold" }}
                  >
                    {column.render("Header")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  );
};

export default Dashboard;
