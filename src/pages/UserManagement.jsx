import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Barcode, Edit, Eye, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { getAllUsers, addUser, updateUser, getRoles, deleteUser } from '../services/user';
import { uploadImage } from '../services/upload';

const UserManagement = () => {

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const { data: userResponce = { data: [] }, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: getAllUsers,
    });

    const { data: roleResponce = { data: [] } } = useQuery({
        queryKey: ['role'],
        queryFn: getRoles,
    });

    const user = userResponce?.data || [];

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            role: '',
            phoneNumber: '',
            password: '',
            profile_pic: '',
        },
    });

    const handleViewClick = (user) => {
        setSelectedUser(user);
        setIsViewing(true);
    };

    const handleAddUser = async (data) => {
        setLoading(true);
        try {
            let profilePicUrl = editing?.profile_pic || '';

            if (data.profilePic && data.profilePic instanceof File) {
                profilePicUrl = await uploadImage(data.profilePic);
            }
            const payload = {
                name: data.name,
                email: data.email,
                role: data.role,
                phoneNumber: data.phoneNumber,
                password: data.password,
                profile_pic: profilePicUrl,
            };

            const response = editing
                ? await updateUser(editing._id, payload)
                : await addUser(payload);
            if (response?.statusCode === 200) {
                toast({
                    title: editing ? 'User Updated' : 'User Added',
                    description: `${data.name} ${editing ? 'updated' : 'added'} successfully.`,
                });
                setIsAdding(false);
                setEditing(null);
                form.reset();
                setImageFiles([]);
                queryClient.invalidateQueries({ queryKey: ['user'] });
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast({
                title: 'Error',
                description: 'Failed to save user. Try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            const response = await deleteUser(selectedId);
            if (response?.statusCode === 200) {
                toast({ title: 'Deleted', description: 'user deleted successfully.' });
                await queryClient.invalidateQueries({ queryKey: ['user'] });
            } else {
                toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedId(null);
        }
    };

    const columns = [
        {
            header: 'Profile',
            accessor: 'profilePic',
            cell: (row) => (
                <img
                    src={row?.profile_pic || '/default-avatar.png'}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                />
            ),
        },
        { header: 'Name', accessor: (row) => row.name || 'Guest User' },
        { header: 'Email', accessor: (row) => row?.email || 'guest@gmail.com' },
        { header: 'Phone Number', accessor: 'phoneNumber' },
        {
            header: 'Role',
            accessor: 'role',
            cell: (row) => <span className="text-blue-600 font-bold">{row?.roleId?.name || "No Role"}</span>,
        },
        {
            header: 'Status',
            accessor: 'isActive',
            cell: (row) =>
                row?.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                ) : (
                    <span className="text-red-500 font-semibold">Inactive</span>
                ),
        },
        {
            header: 'Actions',
            accessor: '',
            cell: (row) => (
                <div className="text-right flex items-center justify-center gap-2">
                    <Eye
                        onClick={() => handleViewClick(row)}
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                    />
                    <Edit
                        onClick={() => {
                            setEditing(row);
                            setIsAdding(true);
                            form.reset({
                                name: row.name,
                                email: row.email,
                                role: row.role,
                                phoneNumber: row.phoneNumber,
                                password: '',
                                profilePic: '',
                            });
                        }}
                        className="h-4 w-4 text-blue-800 cursor-pointer"
                    />
                    <Trash
                        onClick={() => handleDeleteClick(row?._id)}
                        className="h-4 w-4 text-red-500 cursor-pointer"
                    />
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
                <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-800">Add User</Button>
            </div>

            <Card className="p-4">
                <DataTable
                    data={user}
                    columns={columns}
                    searchable={true}
                    searchField="name"
                    isLoading={isLoading}
                />
            </Card>

            {/* Add user & edit Dialog */}
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'name', label: 'Name' },
                                    { name: 'email', label: 'Email' },
                                    { name: 'phoneNumber', label: 'Phone Number' },
                                    { name: 'password', label: 'Password' },
                                ].map(({ name, label }) => (
                                    <FormField
                                        key={name}
                                        control={form.control}
                                        name={name}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{label}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder={label} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField
                                    control={form.control}
                                    name="profilePic"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Profile Picture</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        form.setValue('profilePic', e.target.files[0]);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {roleResponce?.data?.map((e) => (
                                                        <SelectItem value={e?._id}>{e?.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditing(null);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-800 flex items-center gap-2"
                                >
                                    {loading && (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            ></path>
                                        </svg>
                                    )}
                                    {editing ? 'Update User' : 'Add User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>

                </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-800" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View user Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <p className="font-medium">{selectedUser?.name}</p>
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selectedUser?.email}</p>
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <p className="font-medium">{selectedUser?.phoneNumber}</p>
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Badge variant="default" className="capitalize ml-3">{selectedUser.roleId?.name}</Badge>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className={`font-semibold ${selectedUser.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedUser.profilePic && (
                                    <div className="md:col-span-2">
                                        <Label>Profile Picture</Label>
                                        <div className="mt-2">
                                            <img
                                                src={selectedUser.profile_Pic}
                                                alt={selectedUser.name}
                                                className="h-40 w-40 object-cover rounded-full border"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setIsViewing(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
