import axiosInstance from "./httpService";

export const createOrder = async (formData) => {
    const response = await axiosInstance.post("orders", formData);
    return response.data;
};