import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProduct } from "../../services/productService";
import CreateProduct from "./CreateProduct";
import { handleAxiosError } from "../../utils/handleAxiosError.ts";

const UpdateProduct = () => {
  const { id } = useParams();
  const [defaultValues, setDefaultValues] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProduct(id);
        console.log(response);
        setDefaultValues(response);
      } catch (error) {
        handleAxiosError(error, navigate);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (!defaultValues) { 
    return <div>Loading...</div>;
  }

  return (
    <CreateProduct isUpdate={true} defaultValues={defaultValues} />
  );
};

export default UpdateProduct;
