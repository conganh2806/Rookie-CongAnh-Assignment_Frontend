import { useTheme, Chip, Box } from "@mui/material";
import { tokens } from "../../themes";
import { DataGrid } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { handleAxiosError } from "../../utils/handleAxiosError.ts";
import { usePaginationQuery } from "../../hooks/usePaginationQuery";
import { fetchUsers } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import "../../css/common.css";
import Header from "../../components/Header.jsx";

const Account = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const { paginationModel, searchText, setPage, setLimit, setSearchText } =
    usePaginationQuery();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      if (searchText) {
        res = await fetchUsers(
          paginationModel.pageSize,
          paginationModel.page,
          searchText
        );
      } else {
        res = await fetchUsers(paginationModel.pageSize, paginationModel.page);

        console.log("Accounts", res);
      }

      setUsers(res.data);
      setMeta(res.meta);
    } catch (error) {
      handleAxiosError(error, navigate);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchText, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { field: "id", headerName: "ID", flex: 1, minWidth: 150 },
    { field: "first_name", headerName: "First Name", flex: 1, minWidth: 150 },
    { field: "last_name", headerName: "Last Name", flex: 1, minWidth: 150 },
    {
      field: "date_of_birth",
      headerName: "Date of Birth",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params || !params.value) return "";
        return new Date(params.value).toLocaleDateString();
      },
    },
    { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
    { field: "city", headerName: "City", flex: 1, minWidth: 150 },
    { field: "state", headerName: "State", flex: 1, minWidth: 150 },
    { field: "zip_code", headerName: "Zip Code", flex: 1, minWidth: 120 },
    { field: "country", headerName: "Country", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "phone_number",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "is_active",
      headerName: "Active",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
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
          <Chip
            label={params.value ? "Active" : "Inactive"}
            color={params.value ? "success" : "error"}
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            alignItems: "center",
            justifyContent: "left",
            height: "100%"
          }}
        >
          {params.value && params.value.length > 0 ? (
            params.value.map((role, index) => (
              <Chip
                key={index}
                label={role}
                size="small"
                color={colors.grey[600]}
              />
            ))
          ) : (
            <Chip label="No Role" size="small" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params || !params.value) return "";
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params || !params.value) return "";
        return new Date(params.value).toLocaleString();
      },
    },
  ];

  return (
    <Box className="container">
      <Header title="MANAGE USERS" subTitle="Manage users" />
      <Box m="20px">
        {!loading && (
          <DataGrid
            rows={users}
            columns={columns}
            rowCount={meta?.total || 0}
            loading={loading}
            paginationModel={paginationModel}
            pageSizeOptions={[5, 10, 20]}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setLimit(model.pageSize);
            }}
            getRowId={(row) => row.id}
            paginationMode="server"
            sx={{ fontSize: "15px" }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Account;
