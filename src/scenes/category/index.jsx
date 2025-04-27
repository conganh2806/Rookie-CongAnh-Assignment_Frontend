import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, useTheme } from "@mui/material";
import Header from "../../components/Header";
import '../../css/Category.css';
import { DataGrid } from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleAxiosError } from "../../utils/handleAxiosError.ts";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../../services/categoryService";
import EditIcon from "@mui/icons-material/Edit";
import { tokens } from "../../themes";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import AlertDialog from "../../components/Dialogue/AlertDialogue.jsx";

const Category = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteOneDialog, setOpenDeleteOneDialog] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => { 
    setLoading(true);
    try { 
      let res = await fetchCategories();
      console.log(res);
      const flattenCategories = flattenCategoryData(res);
      setCategories(flattenCategories);

      const nameMap = {};
      flattenCategories.forEach(category => {
        nameMap[category.id] = category.name;
      });
      setCategoryNames(nameMap); 
    } catch (error) {
      handleAxiosError(error, navigate);
    } finally { 
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { 
    fetchData();
  }, [fetchData]);

  const flattenCategoryData = (data) => {
    let flatData = [];
    const flatten = (data) => {
      data.forEach(category => {
        flatData.push({
          id: category.id,
          name: category.name,
          parent_id: category.parent_id,
        });

        if (category.sub_categories && category.sub_categories.length > 0) {
          flatten(category.sub_categories);
        }
      });
    };

    flatten(data);
    return flatData;
  };

  const handleEditClick = (category) => { 
    setSelectedCategory(category);
    setOpenModal(true);
  }

  const handleAddClick = () => { 
    setSelectedCategory(null);
    setOpenModal(true);
  }

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (selectedCategory?.id) {
        await updateCategory(selectedCategory.id, {
          name: selectedCategory.name,
          parent_id: selectedCategory.parent_id || null,
        });
        toast.success("Update category successfully!");
      } else {
        await createCategory({
          name: selectedCategory.name,
          parent_id: selectedCategory.parent_id || null,
        });
        toast.success("Add new category successfully!");
      }

      setOpenModal(false);
      await fetchData();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  const handleDeleteOneConfirmed = async () => {
    try {
      const categoryId = deleteId;
      await deleteCategory(categoryId);
      toast.success("Delete successfully !");
      setDeleteId(null);
      setOpenDeleteOneDialog(false);
      await fetchData();
    } catch (error) {
      handleAxiosError(error, navigate);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1, minWidth: 200 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { 
      field: 'parent_id', 
      headerName: 'Parent',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const parentName = categoryNames[params.value];
        return parentName ? <Chip label={parentName} /> : null;
      }
    },
    { 
      field: 'action', 
      headerName: 'Action', 
      flex: 1, 
      minWidth: 150, 
      renderCell: (params) => (
        <Box className="action-container">
          <Tooltip>
            <IconButton 
              color={colors.primary[600]}
              onClick={() => {handleEditClick(params.row)}} 
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
        </Box>
      )
    }
  ];

  return (
    <Box className="category-container">
      <Header title="CATEGORY" subTitle="Managing Categories" />
      <AlertDialog
        open={openDeleteOneDialog}
        text="Are you sure to delete this category ?"
        title="This will delete your category forever"
        onOption1={() => {
          setOpenDeleteOneDialog(false);
        }}
        onOption2={handleDeleteOneConfirmed}
      ></AlertDialog>
      <Box className="filter-box">
        <Box sx={{ display: "flex", alignItems: "center"}}>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {handleAddClick()}}
            >
              Add new category
            </Button>
        </Box>
      </Box>  

      {!loading && (
        <DataGrid
          rows={categories}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          sx={{ fontSize: "15px" }}
          pagination
          pageSizeOptions={[5, 10, 15]}
        />
      )}

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {selectedCategory?.id ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            value={selectedCategory?.name || ''}
            onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={selectedCategory?.parent_id || ''}
              onChange={(e) => setSelectedCategory({ ...selectedCategory, 
                                                  parent_id: e.target.value })}
              label="Parent Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>  
  );
};

export default Category;
