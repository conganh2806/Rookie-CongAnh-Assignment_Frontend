import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PRODUCT_DEFAULT_PAGINATION } from "../constants/productPaginationConfig.ts";

export const usePaginationQuery = () => { 
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [currentPage, setCurrentPage] = useState(() => {
        const value = searchParams.get("Page");
        return Math.max(0, Number(value ?? PRODUCT_DEFAULT_PAGINATION.page));
    });
    
    const [currentLimit, setCurrentLimit] = useState(() => {
        const value = searchParams.get("Limit");
        return Number(value ?? PRODUCT_DEFAULT_PAGINATION.pageSize);
    });
    
    const [currentSearchText, setCurrentSearchText] = useState(() => {
        return searchParams.get("SearchText") ?? "";
    });
    
    useEffect(() => {
        const pageValue = searchParams.get("Page");
        if (pageValue !== null) {
            setCurrentPage(Math.max(0, Number(pageValue)));
        }
        
        const limitValue = searchParams.get("Limit");
        if (limitValue !== null) {
            setCurrentLimit(Number(limitValue));
        }
        
        const searchValue = searchParams.get("SearchText");
        if (searchValue !== null) {
            setCurrentSearchText(searchValue);
        }
    }, [searchParams]);
    
    const paginationModel = useMemo(() => ({ 
        page: currentPage,
        pageSize: currentLimit,
    }), [currentPage, currentLimit]);

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(window.location.search);
        newParams.set(key, value);
        setSearchParams(newParams);
    };
    
    const setPage = (newPage) => {
        setCurrentPage(newPage); 
        updateParam("Page", newPage.toString());
    };
    
    const setLimit = (newLimit) => {
        setCurrentLimit(newLimit);
        updateParam("Limit", newLimit.toString());
    };
    
    const setSearchText = (text) => {
        setCurrentSearchText(text);
        updateParam("SearchText", text);
    };

    return {
        paginationModel,
        searchText: currentSearchText,
        setPage,
        setLimit,
        setSearchText,
        searchParams,
    };
}