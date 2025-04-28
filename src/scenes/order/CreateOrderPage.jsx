import React, { useState, useEffect } from "react";
import {
  TextField,
  Autocomplete,
  Button,
  Box,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  useTheme,
  Typography,
  Select,
  Grid,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  MenuItem,
} from "@mui/material";
import "../../css/common.css";
import Header from "../../components/Header";
import { Controller, useForm } from "react-hook-form";
import { createOrder } from "../../services/orderService";
import { handleAxiosError } from "../../utils/handleAxiosError.ts";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../themes";
import { fetchProducts } from "../../services/productService";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { MINIO_BUCKETNAME, MINIO_URL } from "../../constants/config.js";

// Thêm các hằng số cho payment_type, payment_status và status
const PAYMENT_TYPE = {
  VNPAY: 0,
  COD: 1,
};

const PAYMENT_STATUS = {
  PENDING: 0,
  PAID: 1,
  FAILED: 2,
};

const ORDER_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

const CreateOrderPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [products, setProducts] = useState([]);
  const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
    defaultValues: {
      email: "",
      userName: "",
      phoneNumber: "",
      paymentType: PAYMENT_TYPE.VNPAY,
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: ORDER_STATUS.PENDING,
      note: "",
      orderDetails: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const orderDetails = watch("orderDetails");

  const addProductField = (newProduct) => {
    const orderDetails = getValues("orderDetails");
    setValue("orderDetails", [...orderDetails, newProduct]);
  };

  const removeProductField = (index) => {
    const orderDetails = getValues("orderDetails");
    orderDetails.splice(index, 1);
    setValue("orderDetails", [...orderDetails]);
  };

  const updateProductQuantity = (index, newQuantity) => {
    const currentOrderDetails = [...getValues("orderDetails")];
    currentOrderDetails[index] = {
      ...currentOrderDetails[index],
      quantity: parseInt(newQuantity) || 1
    };
    setValue("orderDetails", currentOrderDetails);
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        email: data.email,
        phone_number: data.phoneNumber,
        user_name: data.userName,
        payment_type: PAYMENT_TYPE.VNPAY,
        payment_status: PAYMENT_STATUS.PENDING,
        status: ORDER_STATUS.PENDING,
        total_amount: calculateTotal(data.orderDetails),
        note: data.note,
        order_details: data.orderDetails.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity || 1,
          price: item.price
        }))
      };

      await createOrder(formattedData);
      alert("Order created successfully!");
      reset();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        console.log(data);
        setProducts(data.data);
      } catch (error) {
        handleAxiosError(error, navigate);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [navigate]);

  // Thêm hàm tính tổng tiền
  const calculateTotal = (orderDetails) => {
    return orderDetails.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
  };

  return (
    <Box className="container">
      <Header title="CREATE NEW ORDER" subTitle="Create new order" />
      <Grid container spacing={2}>
        <Grid size={8}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
              padding: 2,
              border: `2px solid ${colors.grey[600]}`,
              borderRadius: "8px",
            }}
          >
            <Typography
              variant="h4"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Customer Info
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <FormControl fullWidth>
                <TextField
                  label="Name"
                  name="userName"
                  onChange={(event) => setValue("userName", event.target.value)}
                  margin="normal"
                  color={colors.grey[600]}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Phone number"
                  name="phoneNumber"
                  onChange={(event) =>
                    setValue("phoneNumber", event.target.value)
                  }
                  margin="normal"
                  color={colors.grey[600]}
                />
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <TextField
                label="Email"
                name="email"
                onChange={(event) => setValue("email", event.target.value)}
                margin="normal"
                color={colors.grey[600]}
              />
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
              padding: 2,
              border: `2px solid ${colors.grey[600]}`,
              borderRadius: "8px",
            }}
          >
            <Typography
              variant="h4"
              sx={{ marginBottom: 2, fontWeight: "bold" }}
            >
              Add Products to Order
            </Typography>
            {orderDetails.map((product, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                <Card sx={{ display: "flex", alignItems: "center", padding: 1 }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 80, height: 80, borderRadius: 2 }}
                    image={`${MINIO_URL}/${MINIO_BUCKETNAME}/${product.image_url}`}
                    alt={product.name}
                  />
                  <CardContent sx={{ flex: "1 0 auto", display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        ${product.price}
                      </Typography>
                    </Box>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={product.quantity || 1}
                      onChange={(e) => updateProductQuantity(index, e.target.value)}
                      InputProps={{ 
                        inputProps: { min: 1 },
                        sx: { width: '100px' }
                      }}
                      size="small"
                    />
                  </CardContent>
                  <IconButton onClick={() => removeProductField(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Box>
            ))}
            <Autocomplete
              disablePortal
              options={products || []}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => {
                if (newValue) {
                  const currentOrderDetails = getValues("orderDetails");
                  setValue("orderDetails", [...currentOrderDetails, { ...newValue, quantity: 1 }]);
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Product"
                  variant="outlined"
                  color={colors.grey[600]}
                />
              )}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
              padding: 2,
              border: `2px solid ${colors.grey[600]}`,
              borderRadius: "8px",
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="payment-type-label" color={colors.grey[600]}>Payment Type</InputLabel>
              <Select
                labelId="payment-type-label"
                id="payment-type"
                label="Payment Type"
                onChange={(e) => {
                  setValue("paymentType", Number(e.target.value))
                }}
              >
                <MenuItem value="">
                  None
                </MenuItem>
                <MenuItem value="">None</MenuItem>
                <MenuItem value={0}>Cash</MenuItem>
                <MenuItem value={1}>Credit Card</MenuItem>
                <MenuItem value={2}>Paypal</MenuItem>
                <MenuItem value={3}>VNPay</MenuItem>
                <MenuItem value={4}>Momo</MenuItem>
                <MenuItem value={5}>Cash On Delivery</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid size={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
              padding: 2,
              border: `2px solid ${colors.grey[600]}`,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Order Note
            </Typography>
            <FormControl fullWidth>
              <TextField
                label="Note"
                name="note"
                onChange={(event) => setValue("note", event.target.value)}
                margin="normal"
                color={colors.grey[600]}
                multiline
                rows={4}
                placeholder="Add note for this order..."
              />
            </FormControl>
          </Box>

          {/* Order Summary Box */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
              padding: 2,
              border: `2px solid ${colors.grey[600]}`,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Order Summary
            </Typography>
            
            {/* Products Summary */}
            <Box sx={{ mb: 2 }}>
              {orderDetails.map((item, index) => (
                <Box 
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: `1px solid ${colors.grey[300]}`
                  }}
                >
                  <Typography>
                    {item.name} x {item.quantity || 1}
                  </Typography>
                  <Typography>
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Total */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 2,
                borderTop: `2px solid ${colors.grey[600]}`,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Total Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                ${calculateTotal(orderDetails).toFixed(2)}
              </Typography>
            </Box>

            {/* Create Order Button */}
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              sx={{
                marginTop: 2,
                padding: "12px",
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              Create Order
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateOrderPage;
