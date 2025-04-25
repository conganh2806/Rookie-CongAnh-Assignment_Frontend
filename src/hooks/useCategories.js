import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../services/httpService";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get("category");
            setCategories(response.data);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export default useCategories;
