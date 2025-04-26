import axiosInstance from "./httpService";

export const fetchCategories = async (limit, page, searchTerm = "") => {
    const queryString = new URLSearchParams({
        Limit: limit,
        Page: page,
        SearchText: searchTerm,
    }).toString();

    const response = await axiosInstance.get(`/products?${queryString}`);
    return response.data;
};