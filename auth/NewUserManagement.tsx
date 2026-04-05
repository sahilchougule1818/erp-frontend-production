import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './shared/ui/card';
import { Button } from './shared/ui/button';
import { Input } from './shared/ui/input';
import { Label } from './shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './shared/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './shared/ui/table';
import { Badge } from './shared/ui/badge';
import { UserPlus, Trash2, AlertCircle, Mail, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Manager {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

export function UserManagement() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create manager form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  
  // Delete manager
  const [masterOTP, setMasterOTP] = useState('');
  const [showMasterOTP, setShowMasterOTP] = useState(false);
  
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (hasRole('Admin')) {
      fetchManagers();
    }
  }, [hasRole]);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/managers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setManagers(data);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const resetCreateForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRole('');
    setEmailOTP('');
    setShowEmailOTP(false);
    setError('');
  };

  const resetDeleteForm = () => {
    setMasterOTP('');
    setShowMasterOTP(false);
    setSelectedManager(null);
    setError('');
  };

  const handleSendEmailOTP = async () => {
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowEmailOTP(true);
        if (data.otp) {
          console.log('Development OTP:', data.otp);
        }
      } else {
        setError(data.message || 'Failed to send verification OTP');
      }
    } catch (error) {
      setError('Failed to send verification OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/create-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
          emailOTP
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        resetCreateForm();
        setShowCreateModal(false);
        fetchManagers();
        alert('Manager account created successfully!');
      } else {
        setError(data.message || 'Failed to create manager');
      }
    } catch (error) {
      setError('Failed to create manager');
    } finally {
      setLoading(false);
    }
  };

  const handleSendDeleteOTP = async () => {
    setError('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/send-manager-delete-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowMasterOTP(true);
        if (data.otp) {
          console.log('Development OTP:', data.otp);
        }
      } else {
        setError(data.message || 'Failed to send master OTP');
      }
    } catch (error) {
      setError('Failed to send master OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async () => {
    setError('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/delete-manager`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedManager?.user_id,
          masterOTP
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        resetDeleteForm();
        setShowDeleteDialog(false);
        fetchManagers();
        alert('Manager account deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete manager');
      }
    } catch (error) {
      setError('Failed to delete manager');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'IndoorManager': return 'bg-green-100 text-green-800';
      case 'OutdoorManager': return 'bg-blue-100 text-blue-800';
      case 'SalesManager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasRole('Admin')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p>Only Admin users can access user management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Manager
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.user_id}>
                  <TableCell className="font-medium">
                    {manager.first_name} {manager.last_name}
                  </TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(manager.role_name)}>
                      {manager.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={manager.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {manager.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(manager.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedManager(manager);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {managers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No managers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Manager Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Manager</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateManager} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IndoorManager">Indoor Manager</SelectItem>
                  <SelectItem value="OutdoorManager">Outdoor Manager</SelectItem>
                  <SelectItem value="SalesManager">Sales Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!showEmailOTP ? (
              <Button 
                type="button"
                onClick={handleSendEmailOTP}
                disabled={loading || !email || !password || !firstName || !lastName || !role}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Email Verification'}
              </Button>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
                  <p>Verification OTP sent to: <strong>{email}</strong></p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailOTP">Email Verification OTP</Label>
                  <Input
                    id="emailOTP"
                    placeholder="123456"
                    value={emailOTP}
                    onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetCreateForm();
                      setShowCreateModal(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || emailOTP.length !== 6}
                    className="flex-1"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Manager'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Manager Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for <strong>{selectedManager?.first_name} {selectedManager?.last_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {!showMasterOTP ? (
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetDeleteForm}>Cancel</AlertDialogCancel>
              <Button 
                onClick={handleSendDeleteOTP}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Authorization OTP'}
              </Button>
            </AlertDialogFooter>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm">
                <p>Authorization OTP sent to master email</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="masterOTP">Master Authorization OTP</Label>
                <Input
                  id="masterOTP"
                  placeholder="123456"
                  value={masterOTP}
                  onChange={(e) => setMasterOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetDeleteForm}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteManager}
                  disabled={loading || masterOTP.length !== 6}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? 'Deleting...' : 'Delete Manager'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}