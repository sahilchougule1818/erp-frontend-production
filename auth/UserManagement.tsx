import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './shared/ui/card';
import { Button } from './shared/ui/button';
import { Input } from './shared/ui/input';
import { Label } from './shared/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './shared/ui/dialog';
import { Plus, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shared/ui/select';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    roleIds: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(filterRolesByPermission(data));
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  // Filter roles based on current user's permissions
  const filterRolesByPermission = (allRoles: any[]) => {
    if (!user) return [];
    
    const userRole = user.roles?.[0];
    
    // Admin can assign any role EXCEPT Admin (Admin can only be created from login page)
    if (userRole === 'Admin') {
      return allRoles.filter(role => role.role_name !== 'Admin');
    }
    
    // Managers can only assign their own role type
    return allRoles.filter(role => role.role_name === userRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert('User created successfully!');
        setModal(false);
        setForm({ username: '', password: '', email: '', firstName: '', lastName: '', roleIds: [] });
      } else {
        const data = await res.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      alert('Failed to create user');
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />Add User
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Manage system users and their roles</p>
        </CardContent>
      </Card>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />Create New User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.roleIds[0]?.toString()}
                onValueChange={(val) => setForm({ ...form, roleIds: [parseInt(val)] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.role_id} value={role.role_id.toString()}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Create User
              </Button>
              <Button type="button" variant="outline" onClick={() => setModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
