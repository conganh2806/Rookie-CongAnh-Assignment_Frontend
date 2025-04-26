import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../services/httpService";
import useCategories from "../../hooks/useCategories";
import { createProduct, updateProduct, uploadProductsImage } from "../../services/productService";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import UploadImage from "../../components/UploadImage";
import { MINIO_BUCKETNAME, MINIO_URL } from "../../constants/config";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CreateProduct = ({isUpdate = false, defaultValues = null}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => defaultValues || {
    name: "",
    description: "",
    price: 0,
    discount: 0,
    quantity: 0,
    is_featured: false,
    category_ids: [""],
    image_url: "",
  });
  const { categories } = useCategories();
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (index, value) => {
    const updated = [...formData.category_ids];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      category_ids: updated,
    }));
  };

  const handleAddCategory = () => {
    setFormData((prev) => ({
      ...prev,
      category_ids: [...prev.category_ids, ""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let productId = defaultValues?.id;

      if(isUpdate && defaultValues) 
      { 
        await updateProduct(productId, formData);
        toast.success("Product updated successfully!");
      } else { 
        const product = await createProduct(formData);
        productId = product.id;
        toast.success("Product created successfully!");
        
      }
      if(file && productId) { 
        await uploadProductsImage(file, productId);
      }
    
      navigate("/products");
      setPreviewImage(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create product.", error);
    }
  };

  useEffect(() => {
    if (defaultValues) {
      console.log(defaultValues);
      setFormData({
        ...defaultValues,
        category_ids: defaultValues.category_ids || [""],
      });
  
      if (defaultValues.image_url) {
        const correctImageUrl = `${MINIO_URL}/${MINIO_BUCKETNAME}/${defaultValues.image_url}`;
        setPreviewImage(correctImageUrl);
      }
    }
  }, [defaultValues]);

  console.log('formData.image_url:', formData.image_url);
  console.log('previewImage:', previewImage);

  return (
    <Box sx={{ padding: "20px", margin: "50px" }}>
      <Typography variant="h4" gutterBottom>
        {isUpdate ? "Update Product" : "Create New Product"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            color={colors.grey[600]}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            color={colors.grey[600]}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            color={colors.grey[600]}
          />
          <TextField
            fullWidth
            label="Discount"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            margin="normal"
            color={colors.grey[600]}
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            margin="normal"
            color={colors.grey[600]}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_featured: e.target.checked,
                  }))
                }
                name="is_featured"
              />
            }
            label="Is Featured"
          />
          <UploadImage 
            onFileChange={(file) => setFile(file)}
            initialImage={previewImage}
          />
          <Box mt={2}>
            <Typography variant="h6" color={colors.grey[600]}>
              Categories
            </Typography>
            {formData.category_ids.map((catId, index) => (
              <FormControl fullWidth margin="normal" key={index}>
                {/* <InputLabel shrink={true} color={colors.grey[600]}>Category {index + 1}</InputLabel> */}
                <Select
                  value={catId || ""}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  color={colors.grey[600]}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            <Button
              variant="outlined"
              onClick={handleAddCategory}
              sx={{ mt: 2 }}
              color={colors.grey[600]}
            >
              Add Category
            </Button>
          </Box>
        </FormGroup>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 3 }}
        >
          {isUpdate ? 'Update' : 'Create'}
        </Button>
      </form>
    </Box>
  );
};

export default CreateProduct;
