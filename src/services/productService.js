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

export const fetchProductsWithCategory = async (limit, page, categoryId) => { 
    const queryString = new URLSearchParams({
        categoryId: categoryId,
        Limit: limit,
        Page: page,
    }).toString();
    const response = await axiosInstance.get(`/products/category?${queryString}`);
    return response.data;
}

export const fetchProduct = async (productId) => { 
    const response = await axiosInstance.get(`/products/${productId}`);
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
    const response = await axiosInstance.post("products", formData);
    return response.data;
};

export const createProductByCategoryNames = async (formData) => {
    const response = await axiosInstance.post("products/create-by-category-names", formData);
    return response.data;
};

export const updateProduct = async (productId, formData) => {
    console.log(`Product id: ${productId}`);
    console.log(`Form data: ${JSON.stringify(formData)}`);
    const response = await axiosInstance.put(`/products/${productId}`, formData);
    return response.data;
};
