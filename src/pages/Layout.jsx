

import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "../components/utils";
import {
  Users,
  UserCheck,
  FileText,
  CreditCard,
  BarChart3,
  Home,
  GraduationCap,
  Settings,
  Bell,
  LogOut,
  Building2,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from
"@/components/ui/dropdown-menu";
import AuthService from "../components/auth/AuthService";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import { ToastProvider } from "../components/ui/ToastProvider";

const navigationItems = [
{
  title: "Dashboard",
  url: createPageUrl("Dashboard"),
  icon: Home
},
{
  title: "Usuarios",
  url: createPageUrl("Usuarios"),
  icon: Users
},
{
  title: "Roles",
  url: createPageUrl("Roles"),
  icon: Shield
},
{
  title: "Clientes",
  url: createPageUrl("Clientes"),
  icon: Users
},
{
  title: "Instructores",
  url: createPageUrl("Instructores"),
  icon: UserCheck
},
{
  title: "Contratos",
  url: createPageUrl("Contratos"),
  icon: FileText
},
{
  title: "Gestoría Ventas",
  url: createPageUrl("GestoriaVentas"),
  icon: Building2
},
{
  title: "Movimientos",
  url: createPageUrl("MovimientosContables"),
  icon: CreditCard
},
{
  title: "Reportes",
  url: createPageUrl("Reportes"),
  icon: BarChart3
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [logoutDialog, setLogoutDialog] = useState({ isOpen: false });

  useEffect(() => {
    // Obtener datos del usuario actual
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);

    // Ensure only light mode styles are applied
    const root = window.document.documentElement;
    root.classList.remove("dark");
  }, []);

  const handleLogout = () => {
    setLogoutDialog({
      isOpen: true,
      title: '¿CERRAR SESIÓN?',
      description: 'Serás redirigido a la pantalla de inicio de sesión.',
      onConfirm: () => {
        AuthService.logout();
        setLogoutDialog({ isOpen: false });
      },
      confirmText: 'SÍ, SALIR'
    });
  };

  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <style>
            {`
            :root {
              --background: #ffffff;
              --foreground: #000000;
              --card: #ffffff;
              --card-foreground: #000000;
              --popover: #ffffff;
              --popover-foreground: #000000;
              --primary: #000000;
              --primary-foreground: #ffffff;
              --secondary: #f3f4f6;
              --secondary-foreground: #000000;
              --muted: #f3f4f6;
              --muted-foreground: #6b7280;
              --accent: #f59e0b;
              --accent-foreground: #000000;
              --destructive: #ef4444;
              --destructive-foreground: #ffffff;
              --border: #000000;
              --input: #ffffff;
              --ring: #000000;
              --radius: 0px;

              --neo-shadow: 4px 4px 0px #000000;
              --neo-shadow-hover: 6px 6px 0px #000000;
              --neo-yellow: #fbbf24;
              --neo-pink: #ec4899;
              --neo-blue: #3b82f6;
              --neo-green: #10b981;
              --neo-red: #ef4444;
            }

            * {
              border-radius: 0px !important;
            }

            .neo-card {
              border: 3px solid var(--border);
              box-shadow: var(--neo-shadow);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              background: var(--card);
            }

            .neo-card:hover {
              box-shadow: var(--neo-shadow-hover);
              transform: translate(-2px, -2px);
            }

            .neo-button {
              border: 3px solid var(--border);
              box-shadow: 3px 3px 0px var(--border);
              transition: all 0.1s;
              font-weight: 800;
              text-transform: uppercase;
              border-radius: 0px !important;
            }

            .neo-button:hover {
              box-shadow: 5px 5px 0px var(--border);
              transform: translate(-2px, -2px);
            }

            .neo-button:active {
              box-shadow: 1px 1px 0px var(--border);
              transform: translate(1px, 1px);
            }

            .neo-input {
              border: 3px solid var(--border);
              box-shadow: none;
              background: var(--input);
              border-radius: 0px !important;
            }

            .neo-sidebar {
              border-right: 4px solid var(--border);
              background: var(--card);
            }

            /* Ensure select and dropdowns work well with light theme */
            [data-radix-select-content],
            [data-radix-dropdown-menu-content] {
              background: var(--card) !important;
              border: 3px solid var(--border) !important;
              box-shadow: var(--neo-shadow) !important;
            }

            [data-radix-select-item],
            [data-radix-dropdown-menu-item] {
              color: var(--foreground) !important;
            }

            [data-radix-select-item][data-highlighted],
            [data-radix-dropdown-menu-item][data-highlighted] {
              background: var(--accent) !important;
              color: var(--accent-foreground) !important;
            }
            `}
          </style>
          <div className="min-h-screen flex w-full bg-background text-foreground">
            <Sidebar className="neo-sidebar">
              <SidebarHeader className="border-b-4 border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white border-4 border-border neo-card flex items-center justify-center p-1">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b819a7cae_Emblema-azul-fondo-transparente.png"
                      alt="Kovac Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <GraduationCap className="w-6 h-6 text-foreground hidden" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase">KOVAC C.A.</h2>
                    <p className="text-sm text-muted-foreground font-bold uppercase">AUTOESCUELA Y GESTORIA</p>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="bg-slate-100 p-4 flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2 py-4 mb-2">
                    NAVEGACIÓN
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-2">
                      {navigationItems.map((item) =>
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                          asChild
                          className={`neo-button h-12 px-4 text-sm font-black uppercase transition-all ${
                          location.pathname === item.url ?
                          'bg-accent text-foreground' :
                          'bg-card text-foreground hover:bg-secondary'}`
                          }>

                            <Link to={item.url} className="flex items-center gap-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t-4 border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground border-3 border-border neo-card flex items-center justify-center">
                      <span className="text-foreground font-black text-sm">
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-foreground text-sm uppercase">
                        {currentUser?.name || currentUser?.email?.split('@')[0] || 'Usuario'}
                      </p>
                      <p className="text-xs text-muted-foreground font-bold">
                        {currentUser?.role || 'ADMIN'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 neo-button bg-secondary hover:bg-muted">
                      <Bell className="w-4 h-4 text-foreground" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 neo-button bg-secondary hover:bg-muted">
                          <Settings className="w-4 h-4 text-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="neo-card border-4 border-border" align="end">
                        <DropdownMenuLabel className="font-black uppercase">Configuración</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border h-1" />
                        <DropdownMenuItem
                          className="font-bold uppercase text-destructive"
                          onClick={handleLogout}>

                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="bg-card border-b-4 border-border px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="neo-button p-2 bg-secondary" />
                  <h1 className="text-xl font-black text-foreground uppercase">KOVAC C.A.</h1>
                </div>
              </header>

              <div className="flex-1 overflow-auto bg-slate-500">
                {children}
              </div>
            </main>
          </div>
          <ConfirmationDialog
            isOpen={logoutDialog.isOpen}
            onCancel={() => setLogoutDialog({ isOpen: false })}
            onConfirm={logoutDialog.onConfirm}
            title={logoutDialog.title}
            description={logoutDialog.description}
            confirmText={logoutDialog.confirmText}
          />
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}

