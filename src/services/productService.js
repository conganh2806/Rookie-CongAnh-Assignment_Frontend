import axiosInstance from "./httpService";

export const fetchProducts = async (limit, page, searchTerm = "") => {
    const queryString = new URLSearchParams({
        Limit: limit,
        Page: page,
        SearchText: searchTerm,
    }).toString();

    const response = await axiosInstance.get(`/products?${queryString}`);
    return response.data;
};

export const fetchProductsWithCategory = async (categoryId) => { 
    const response = await axiosInstance.get(`/products/category/${categoryId}`);
    return response.data;
}

export const deleteProduct = async(productId) => { 
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
}

export const deleteProducts = async (product_ids) => {
    const response = await axiosInstance.delete('/products/delete-multiple', {
      data: { product_ids }
    });
    console.log("OK", response);
    return response.data;
};

export const uploadProductsImage = async (file, productId) => {
    const formData = new FormData();
    formData.append("File", file);
    formData.append("ProductId", productId);

    return axiosInstance.post("/products/upload-media", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const createProduct = async (formData) => {
    console.log("createProduct", formData);
    const response = await axiosInstance.post("products", formData);
    return response.data;
};

export const createProductByCategoryNames = async (formData) => {
    console.log("createProduct", formData);
    const response = await axiosInstance.post("products/create-by-category-names", formData);
    return response.data;
};

