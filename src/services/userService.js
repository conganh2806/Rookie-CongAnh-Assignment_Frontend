import axiosInstance from "./httpService";

export const fetchUsers = async (limit, page, searchTerm = "") => {
    const queryString = new URLSearchParams({
        Limit: limit,
        Page: page,
        SearchText: searchTerm,
    }).toString();

    const response = await axiosInstance.get(`user?${queryString}`);
    console.log("Accounts", response);
    return response.data;
};

export const fetchUsersWithUserRole = async (searchTerm = "") => {
    const response = await axiosInstance.get(`user/users`);
    console.log("Users with 'user' role:", response);
    return response.data;
};

