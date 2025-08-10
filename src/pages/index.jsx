import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Clientes from "./Clientes";

import Instructores from "./Instructores";

import Contratos from "./Contratos";

import GestoriaVentas from "./GestoriaVentas";

import MovimientosContables from "./MovimientosContables";

import Reportes from "./Reportes";

import Usuarios from "./Usuarios";

import Roles from "./Roles";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Clientes: Clientes,
    
    Instructores: Instructores,
    
    Contratos: Contratos,
    
    GestoriaVentas: GestoriaVentas,
    
    MovimientosContables: MovimientosContables,
    
    Reportes: Reportes,
    
    Usuarios: Usuarios,
    
    Roles: Roles,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Clientes" element={<Clientes />} />
                
                <Route path="/Instructores" element={<Instructores />} />
                
                <Route path="/Contratos" element={<Contratos />} />
                
                <Route path="/GestoriaVentas" element={<GestoriaVentas />} />
                
                <Route path="/MovimientosContables" element={<MovimientosContables />} />
                
                <Route path="/Reportes" element={<Reportes />} />
                
                <Route path="/Usuarios" element={<Usuarios />} />
                
                <Route path="/Roles" element={<Roles />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}