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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createProduct, updateProduct, uploadProductsImage } from "../../services/productService";
import useCategories from "../../hooks/useCategories";
import UploadImage from "../../components/UploadImage";
import { MINIO_BUCKETNAME, MINIO_URL } from "../../constants/config";

// ==============================
// Validation schema
const productSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  price: yup.number().typeError("Price must be a number").positive("Price must be positive").required(),
  discount: yup.number().typeError("Discount must be a number").min(0).required(),
  quantity: yup.number().typeError("Quantity must be a number").min(0).required(),
  is_featured: yup.boolean(),
  category_ids: yup.array().of(yup.string().required("Category is required")).min(1, "At least one category required"),
  image_url: yup.string().nullable(),
});

const CreateProduct = ({ isUpdate = false, defaultValues = null }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
      quantity: 0,
      is_featured: false,
      category_ids: [""],
      image_url: "",
      ...defaultValues,
    },
  });

  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const categoryIds = watch("category_ids");

  const onSubmit = async (data) => {
    try {
      let productId = defaultValues?.id;

      if (isUpdate && defaultValues) {
        await updateProduct(productId, data);
        toast.success("Product updated successfully!");
      } else {
        const product = await createProduct(data);
        productId = product.id;
        toast.success("Product created successfully!");
      }

      if (file && productId) {
        await uploadProductsImage(file, productId);
      }

      navigate("/products");
      setPreviewImage(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit the product.");
    }
  };

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        category_ids: defaultValues.category_ids || [""],
      });

      if (defaultValues.image_url) {
        const correctImageUrl = `${MINIO_URL}/${MINIO_BUCKETNAME}/${defaultValues.image_url}`;
        setPreviewImage(correctImageUrl);
      }
    }
  }, [defaultValues, reset]);

  const handleAddCategory = () => {
    setValue("category_ids", [...categoryIds, ""]);
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = [...categoryIds];
    updatedCategories.splice(index, 1);
    setValue("category_ids", updatedCategories);
  };

  return (
    <Box sx={{ padding: "20px", margin: "50px" }}>
      <Typography variant="h4" gutterBottom>
        {isUpdate ? "Update Product" : "Create New Product"}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <TextField
            fullWidth
            label="Name"
            {...register("name")}
            margin="normal"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            fullWidth
            label="Description"
            {...register("description")}
            margin="normal"
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            {...register("price")}
            margin="normal"
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
          />
          <TextField
            fullWidth
            label="Discount"
            type="number"
            {...register("discount")}
            margin="normal"
            error={Boolean(errors.discount)}
            helperText={errors.discount?.message}
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            {...register("quantity")}
            margin="normal"
            error={Boolean(errors.quantity)}
            helperText={errors.quantity?.message}
          />

          <FormControlLabel
            control={
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                  />
                )}
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

            {categoryIds.map((catId, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControl fullWidth margin="normal">
                  <Controller
                    name={`category_ids.${index}`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        displayEmpty
                        error={Boolean(errors.category_ids?.[index])}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.category_ids?.[index] && (
                    <Typography variant="body2" color="error">
                      {errors.category_ids[index]?.message}
                    </Typography>
                  )}
                </FormControl>
                <Button
                  onClick={() => handleRemoveCategory(index)}
                  color="error"
                  variant="outlined"
                >
                  Remove
                </Button>
              </Box>
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
