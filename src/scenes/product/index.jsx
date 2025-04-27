import {
  Box,
  Button,
  Chip,
  InputBase,
  Select,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../themes";
import Header from "../../components/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProductByCategoryNames,
  deleteProduct,
  deleteProducts,
  fetchProducts,
  fetchProductsWithCategory,
} from "../../services/productService";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useSearchParams } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import useCategories from "../../hooks/useCategories";
import { DataTable } from "primereact/datatable";
import { handleAxiosError } from "../../utils/handleAxiosError.ts";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AlertDialog from "../../components/Dialogue/AlertDialogue.jsx";
import { Image } from "primereact/image";
import {
  API_BASE_URL,
  MINIO_BUCKETNAME,
  MINIO_URL,
} from "../../constants/config.js";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { DEFAULT_PAGINATION } from "../../constants/productPaginationConfig.ts";
import SearchBar from "../../components/SearchBar.jsx";
import "../../css/Product.css";
import debounce from "lodash.debounce";
import { usePaginationQuery } from "../../hooks/usePaginationQuery.js";

const Product = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { categories: categoryOptions, loading: categoryLoading } =
    useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteOneDialog, setOpenDeleteOneDialog] = useState(false);
  const [openDeleteManyDialog, setOpenDeleteManyDialog] = useState(false);
  const {
    paginationModel,
    searchText,
    setPage,
    setLimit,
    setSearchText,
  } = usePaginationQuery();

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 150,
      renderCell: (params) => {
        return (
          <img
            src={`${MINIO_URL}/${MINIO_BUCKETNAME}/${params.row.image_url}`}
            alt="product"
            className="product-image"
          />
        );
      },
    },
    { field: "id", headerName: "ID", width: 220 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    { field: "price", headerName: "Price", type: "number", width: 100 },
    { field: "discount", headerName: "Discount", type: "number", width: 100 },
    { field: "quantity", headerName: "Quantity", type: "number", width: 100 },
    { field: "sold", headerName: "Sold", type: "number", width: 100 },
    { field: "product_status", headerName: "Status", type: "number" },
    { field: "is_featured", headerName: "Featured", type: "boolean" },
    {
      field: "categories",
      headerName: "Categories",
      width: 300,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              alignItems: "center",
              justifyContent: "left",
              height: "100%",
            }}
          >
            {params.row.category_names?.map((name, index) => (
              <Chip key={index} label={name} size="small" />
            ))}
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Box className="action-container">
          <Tooltip title="Update" placement="top">
            <IconButton
              color={colors.primary[600]}
              onClick={() => {
                setSelectedProduct(params.row);
                navigate(`edit/${params.row.id}`);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <IconButton
              color="error"
              onClick={() => {
                setDeleteId(params.row.id);
                setOpenDeleteOneDialog(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate" placement="top">
            <IconButton
              onClick={() => {
                handleDuplicate(params.row);
              }}
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleSearch = useMemo(() =>
    debounce((text) => {
      setSearchText(text);
      setPage(0);
    }, 500),
  [setSearchText, setPage], []);

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  const handleDuplicate = async (product) => {
    const newProduct = {
      ...product,
      name: product.name + " (Copy)",
    };
    try {
      await createProductByCategoryNames(newProduct);
      toast.success("Duplicate product successfully");
      await fetchData();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  const handleDeleteOneConfirmed = async () => {
    try {
      const productId = deleteId;
      await deleteProduct(productId);
      toast.success("Delete successfully !");
      setDeleteId(null);
      setOpenDeleteOneDialog(false);
      await fetchData();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  const handleDeleteManyConfirmed = async () => {
    const idsToDelete = Array.from(rowSelectionModel.ids);
    if (idsToDelete.length === 0) {
      toast.warning("No products selected to delete.");
      return;
    }
    try {
      await deleteProducts(idsToDelete);
      toast.success("Deleted selected products successfully!");
      setRowSelectionModel({ type: "include", ids: new Set() });
      setOpenDeleteManyDialog(false);
      await fetchData();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
  
      if (searchText) {
        res = await fetchProducts(
          paginationModel.pageSize,
          paginationModel.page,
          searchText,
        );
      } else if(selectedCategoryId) {
        res = await fetchProductsWithCategory(
          paginationModel.pageSize,
          paginationModel.page,
          selectedCategoryId
        );
      } else {
        res = await fetchProducts(
          paginationModel.pageSize,
          paginationModel.page
        );
      }
  
      setProducts(res.data);
      setMeta(res.meta);
    } catch (error) {
      handleAxiosError(error, navigate);
    } finally {
      setLoading(false);
    }
  }, [
    paginationModel.page,
    paginationModel.pageSize,
    selectedCategoryId,
    searchText,
    navigate,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // useEffect(() => { 
  //   console.log(products);
  // }, [products]);

  return (
    <Box className="product-container">
      <Header title="PRODUCT" subTitle="Managing the Products" />
      <AlertDialog
        open={openDeleteOneDialog}
        text="Are you sure to delete this product ?"
        title="This will delete your product forever"
        onOption1={() => {
          setOpenDeleteOneDialog(false);
        }}
        onOption2={handleDeleteOneConfirmed}
      ></AlertDialog>
      <AlertDialog
        open={openDeleteManyDialog}
        text="Are you sure to delete multiple products ?"
        title="This will delete your products forever"
        onOption1={() => {
          setOpenDeleteManyDialog(false);
        }}
        onOption2={handleDeleteManyConfirmed}
      ></AlertDialog>
      <Box className="filter-box">
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" mr={2}>
            Filter by
          </Typography>

          <Select
            value={selectedCategoryId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedCategoryId(selectedId);
            }}
            displayEmpty
            size="small"
            className="MuiSelect-root"
          >
            <MenuItem value="">All Categories</MenuItem>
            {categoryOptions.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>

          <Box m={2}>
            <SearchBar onChange={handleSearch}/>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {rowSelectionModel.ids.size > 1 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteManyDialog(true)}
              sx={{ mr: 2 }}
            >
              Delete Selected ({rowSelectionModel.ids.size})
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProduct(null);
              navigate("new");
            }}
          >
            Add product
          </Button>
        </Box>
      </Box>
      {!loading && (
        <DataGrid
          loading={loading}
          rows={products}
          rowCount={meta?.total ?? products.length}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          pagination
          paginationModel={paginationModel}
          sortModel={sortModel}
          filterModel={filterModel}
          paginationMode="server"
          // sortingMode="server"
          filterMode="server"
          pageSizeOptions={[5, 10, 15]}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setLimit(model.pageSize);
          }}
          onSortModelChange={setSortModel}
          onFilterModelChange={setFilterModel}
          sx={{ fontSize: "15px" }}
          //   disableRowSelectionOnClick
        />
      )}
    </Box>
  );
};

export default Product;
