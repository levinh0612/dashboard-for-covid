import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import axios from 'axios';
import { useEffect } from 'react';
import { Alert, Badge, Snackbar } from '@mui/material';
import moment from 'moment';
import 'moment/locale/vi';
import DetailCountry from '../Detail/index.js';



function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'Country',
    disablePadding: true,
    label: 'Tên nước',
  },
  {
    id: 'NewConfirmed',
    numeric: true,
    disablePadding: false,
    label: 'Số ca nhiễm mới',
  },
  {
    id: 'NewDeaths',
    numeric: true,
    disablePadding: false,
    label: 'Số ca tử vong mới',
  },
  {
    id: 'NewRecovered',
    numeric: true,
    disablePadding: false,
    label: 'Số ca hồi phục',
  },
  {
    id: 'TotalConfirmed',
    numeric: true,
    disablePadding: false,
    label: 'Tổng số ca nhiễm',
  },
  {
    id: 'TotalDeaths',
    numeric: true,
    disablePadding: false,
    label: 'Tổng số ca tử vong',
  },
  {
    id: 'TotalRecovered',
    numeric: true,
    disablePadding: false,
    label: 'Tổng số ca hồi phục',
  },
];



/* Header */
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } =
    props;
  const createSortHandler =
    (property) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead >
      <TableRow sx={{ background: "#dedede", borderRadius: 4 }}>
        {headCells.map((headCell) => (
          <TableCell
            sx={{ whiteSpace: "nowrap", fontSize: 16, fontWeight: 900 }}
            key={headCell.id}
            align={'center'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

/* Row */
function CovidTable() {

  const [allInfo, setAllInfo] = React.useState([]);
  const [error, setError] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState('TotalConfirmed');
  const [selectedInfo, setSelectedInfo] = React.useState("");

  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isOpenDetail, setIsOpenDetail] = React.useState(false);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleClick = (event: React.MouseEvent<unknown>, code: string) => {
    console.log('GO HERE')
    setSelectedInfo(code);
    handleOpenDetail();
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };


  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - allInfo['Countries'].length) : 0;


  const apiGetSummary = async () => {
    await axios.get("https://api.covid19api.com/summary")
      .then(response => {
        if (response.data['Message'] === "Caching in progress") {

          setError('Server bị lỗi trong việc lấy dữ liệu!')
          handleOpenToastError()
        } else {
          setAllInfo(response.data)
        }
      })
      .catch(err => {
        setError(err)
        handleOpenToastError()
      });
  }

  const handleOpenToastError = () => {
    setIsError(true);
  };

  const handleCloseToastError = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleOpenDetail = () => {
    setIsOpenDetail(true)
  }
  const handleCloseDetail = () => {
    setIsOpenDetail(false)
  }

  useEffect(() => {
    apiGetSummary()
  }, [])


  return (
    <Box sx={{ padding: 4 }}>
      <Snackbar anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }} open={isError} autoHideDuration={3000} onClose={handleCloseToastError}>
        <Alert severity="error" onClose={handleCloseToastError} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Box>
        <Typography
          sx={{ flex: '1 1 100%', fontWeight: 800 }}
          variant="h3"
          id="tableTitle"
          component="div"
        >
          Bảng thống kê Covid19
        </Typography>
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h5"
          id="tableTitle"
          component="div"
        >
          Cập nhật lần cuối:
          <Badge sx={{
            marginLeft: '4px',
            background: 'black', color: "white", padding: '0.25em 0.4em',
            fontSize: '75%',
            fontWeight: 700,
            lineHeight: 1,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            verticalAlign: 'baseline',
            borderRadius: '0.25rem'
          }}>
            {`${moment(allInfo['Date']).format('l')}`}
          </Badge>
        </Typography>
      </Box>
      {
        allInfo['Countries']?.length > 0 && (
          <Box sx={{ width: '100%', margin: '16px 0' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={dense ? 'small' : 'medium'}
                >
                  <EnhancedTableHead
                    numSelected={selectedInfo.length}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={allInfo['Countries'].length}
                  />
                  <TableBody>
                    {stableSort(allInfo['Countries'], getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row: any, index) => {

                        return (
                          <TableRow
                            sx={{cursor: "pointer"}}
                            hover
                            onClick={(event) => handleClick(event, row.CountryCode)}
                            role="checkbox"
                            tabIndex={-1}
                            key={row.ID}
                          >
                            <TableCell align="left" sx={{ width: 250, whiteSpace: 'nowrap' }} >{row.Country}</TableCell>
                            <TableCell align="center">{row.NewConfirmed.toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="center">{row.NewDeaths.toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="center">{row.NewRecovered.toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="center">{row.TotalConfirmed.toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="center">{row.TotalDeaths.toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="center">{row.TotalRecovered.toLocaleString('vi-VN')}</TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow
                        style={{
                          height: (dense ? 33 : 53) * emptyRows,
                        }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`}
                labelRowsPerPage={"Số dòng"}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={allInfo['Countries'].length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
            <FormControlLabel
              control={<Switch checked={dense} onChange={handleChangeDense} />}
              label="Thu gọn"
            />

          </Box>
        )
      }
      {isOpenDetail && (
        <DetailCountry CountryCode = {selectedInfo} open={isOpenDetail} onClose = {handleCloseDetail}/>
      )}

    </Box>
  );
}
export default React.memo(CovidTable)