import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Login from "./scenes/Auth/Login";
import Product from "./scenes/product";
// import Invoices from "./scenes/invoices";
// import Contacts from "./scenes/contacts";
// import Bar from "./scenes/bar";
// import Form from "./scenes/form";
// import Line from "./scenes/line";
// import Pie from "./scenes/pie";
// import FAQ from "./scenes/faq";
// import Geography from "./scenes/geography";
// import Calendar from "./scenes/calendar";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./themes";
import { AuthProvider } from "./context/auth-context";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import CreateProduct from "./scenes/product/CreateProduct";
import './css/App.css';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
              <Routes>
                <Route path="/login" element={<Login />}></Route>
                <Route 
                  path="/*"
                  element={
                    <PrivateRoute>
                      <div className="app">
                        <Sidebar />
                        <main className="content">
                          <Topbar />
                          <Routes>
                            <Route path="/" element={<Dashboard />}></Route>
                            <Route path="/products" element={<Product />}></Route>
                            <Route path="/products/new" element={<CreateProduct />}></Route>
                            {/* <Route path="/contacts" element={<Contacts />}></Route> */}
                            {/* <Route path="/invoices" element={<Invoices />}></Route> */}
                            {/* <Route path="/form" element={<Form />}></Route> */}
                            {/* <Route path="/bar" element={<Bar />}></Route> */}
                            {/* <Route path="/pie" element={<Pie />}></Route> */}
                            {/* <Route path="/line" element={<Line />}></Route> */}
                            {/* <Route path="/faq" element={<FAQ />}></Route> */}
                            {/* <Route path="/geography" element={<Geography />}></Route> */}
                            {/* <Route path="/calendar" element={<Line />}></Route> */}
                          </Routes>
                        </main>
                      </div>
                    </PrivateRoute>
                  }
                >
                </Route>
              </Routes>
            <ToastContainer />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;
