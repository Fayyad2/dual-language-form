import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, UserPlus, FileText, Mail, Phone } from "lucide-react"

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "on-leave";
  approvalLevel: string;
  whatsappNumber?: string;
}

const sampleEmployees: Employee[] = [
  {
    id: "1",
    name: "Fayad Adel",
    department: "HR",
    role: "HR Manager",
    email: "fayad@nmc.com",
    phone: "+966508089930",
    status: "active",
    approvalLevel: "Level 1",
    whatsappNumber: "+966508089930"
  },
  {
    id: "2",
    name: "Mohammed Ayed",
    department: "HR",
    role: "HR Specialist",
    email: "mohammed@nmc.com",
    phone: "+966505940265",
    status: "active",
    approvalLevel: "Level 1",
    whatsappNumber: "+966505940265"
  },
  {
    id: "3",
    name: "Sultan Ibrahim",
    department: "HR",
    role: "HR Manager",
    email: "sultan@nmc.com",
    phone: "+966551647115",
    status: "active",
    approvalLevel: "Level 2",
    whatsappNumber: "+966551647115"
  },
  {
    id: "4",
    name: "E.khatib",
    department: "Engineering",
    role: "CEO/Engineer",
    email: "e.khatib@nmc.com",
    phone: "+966543147489",
    status: "active",
    approvalLevel: "Level 3",
    whatsappNumber: "+966543147489"
  },
  {
    id: "5",
    name: "Imad Abdel Halim",
    department: "Project Management",
    role: "Project Manager",
    email: "imad@nmc.com",
    phone: "+966556041887",
    status: "active",
    approvalLevel: "Level 2",
    whatsappNumber: "+966556041887"
  },
  {
    id: "6",
    name: "Finance Department",
    department: "Finance",
    role: "Finance Officer",
    email: "finance@nmc.com",
    phone: "+966536107050",
    status: "active",
    approvalLevel: "Level 4",
    whatsappNumber: "+966536107050"
  }
]

export function EmployeesDashboard() {
  const [employees] = useState<Employee[]>(sampleEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Employee["status"]) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      "on-leave": "outline"
    } as const

    return (
      <Badge variant={variants[status]}>
        {status === "on-leave" ? "On Leave" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const generateReport = (employee: Employee) => {
    // Placeholder for report generation
    console.log("Generating report for:", employee.name)
  }

  const sendWhatsApp = (employee: Employee) => {
    if (employee.whatsappNumber) {
      const message = encodeURIComponent(`Hello ${employee.name}, this is a message from NMC HR system.`)
      window.open(`https://wa.me/${employee.whatsappNumber.replace('+', '')}?text=${message}`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage employees, generate reports, and perform quick actions
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>

      {/* Employee Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {employee.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                <TableCell>{employee.approvalLevel}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => generateReport(employee)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => sendWhatsApp(employee)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Send WhatsApp
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary">
            {employees.filter(e => e.status === "active").length}
          </div>
          <div className="text-sm text-muted-foreground">Active Employees</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-500">
            {employees.filter(e => e.status === "on-leave").length}
          </div>
          <div className="text-sm text-muted-foreground">On Leave</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-500">
            {new Set(employees.map(e => e.department)).size}
          </div>
          <div className="text-sm text-muted-foreground">Departments</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-500">
            {employees.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Employees</div>
        </div>
      </div>
    </div>
  )
}