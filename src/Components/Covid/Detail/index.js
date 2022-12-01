import { Box, Dialog, DialogTitle, Alert, Snackbar, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import axios from 'axios';

export default function DetailCountry(props) {
  const { CountryCode, open, onClose } = props;
  const [error, setError] = React.useState("");
  const [isError, setIsError] = React.useState(false);
  const [data, setData] = React.useState({})
  console.log('GO')
  const apiGetDetail = async () => {
    axios.get(`https://restcountries.com/v2/alpha/${CountryCode}`)
      .then(function (response) {
        console.log(response)
        setData(response.data);
      })
      .catch(function (error) {
        setError(error)
        handleOpenToastError()
      });
  }

  const handleOpenToastError = () => {
    setIsError(true);
  };

  const handleCloseToastError = () => {
    setIsError(false);
  };

  useEffect(() => {
    apiGetDetail()
  }, [CountryCode])
  return (
    data?.flag && (
      <Dialog open={open} onClose={onClose} >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 25 }}>Thông tin nước {data?.name}: </DialogTitle>

          <img src={data?.flag} style={{ height: '150px' }} alt={data?.name} />
        <Box sx={{ width: 500, padding: 4, display: 'flex', justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
          <Box sx={{ margin: '0 16px' }}>
            <Typography>
              <strong>Tên nước: </strong>{data?.name}
            </Typography>
            <Typography>
              <strong>Dân số: </strong> {data?.population.toLocaleString('vi-VN')} người
            </Typography>
            <Typography>
              <strong>Thủ đô: </strong> {data?.capital}
            </Typography>
            <Typography>
              <strong>Khu vực: </strong> {data?.region}
            </Typography>
            <Typography>
              <strong>Khu vực phụ: </strong> {data?.subregion}
            </Typography>
          </Box>
        </Box>

        <Snackbar anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }} open={isError} autoHideDuration={3000} onClose={handleCloseToastError}>
          <Alert severity="error" onClose={handleCloseToastError} sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

      </Dialog>
    )
  )
}
