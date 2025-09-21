import { useState } from "react"
import { Users, FileText, Settings, BarChart3, Calendar, Home, ChevronRight } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const sidebarItems = [
  { title: "Dashboard", key: "dashboard", icon: Home },
  { title: "Payment Orders", key: "payment-orders", icon: FileText },
  { title: "Employees", key: "employees", icon: Users },
  { title: "Reports", key: "reports", icon: BarChart3 },
  { title: "Calendar", key: "calendar", icon: Calendar },
  { title: "Settings", key: "settings", icon: Settings },
]

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-primary border-l-4 border-sidebar-primary shadow-sm" 
      : "hover:bg-sidebar-accent/60 hover:translate-x-1 text-sidebar-foreground/80 hover:text-sidebar-foreground"

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border shadow-lg`}>
      <SidebarContent className="p-4">
        {/* Brand Section */}
        <div className="mb-8 px-2">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-primary">Dashboard</h2>
                <p className="text-xs text-sidebar-foreground/60">Management System</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-3 ${collapsed ? "text-center" : "px-2"}`}>
            {collapsed ? "•••" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 px-3 py-3 rounded-xl transition-all duration-200 ease-in-out group ${getNavCls(
                        activeSection === item.key
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 transition-transform duration-200 ${activeSection === item.key ? "scale-110" : "group-hover:scale-105"}`} />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </div>
                      {!collapsed && activeSection === item.key && (
                        <ChevronRight className="h-4 w-4 text-sidebar-primary" />
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Section */}
        {!collapsed && (
          <div className="mt-auto pt-6 px-2">
            <div className="bg-sidebar-accent/50 rounded-lg p-3 border border-sidebar-border/50">
              <p className="text-xs text-sidebar-foreground/60 text-center">
                Version 1.0.0
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}