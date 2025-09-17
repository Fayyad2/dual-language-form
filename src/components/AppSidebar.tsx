import { useState } from "react"
import { Users, FileText, Settings, BarChart3, Calendar, Home } from "lucide-react"
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
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/50"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full flex items-center justify-start gap-3 p-3 rounded-lg transition-colors ${getNavCls(
                        activeSection === item.key
                      )}`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}