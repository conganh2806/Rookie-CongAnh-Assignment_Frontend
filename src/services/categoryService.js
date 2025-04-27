import axiosInstance from "./httpService";

export const fetchCategories = async () => {
    const response = await axiosInstance.get(`category`);
    return response.data;
};

export const createCategory = async (formData) => {
    const response = await axiosInstance.post("category", formData);
    return response.data;
};

export const updateCategory = async (categoryId, formData) => {
    console.log(`Category id: ${categoryId}`);
    console.log(`Form data: ${JSON.stringify(formData)}`);
    const response = await axiosInstance.put(`category/${categoryId}`, formData);
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    return await axiosInstance.delete(`category/${categoryId}`);
} 