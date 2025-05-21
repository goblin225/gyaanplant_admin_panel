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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { createCompany, getAllCompany, deleteCompany, updateCompany } from '../services/comapny';
import { uploadImage } from '../services/upload';

const Company = () => {

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [isViewing, setIsViewing] = useState(false);
    const [selected, setSelected] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [loading, setLoading] = useState(false);

    const { data: companyResponce = { data: [] }, isLoading } = useQuery({
        queryKey: ['company'],
        queryFn: getAllCompany,
    });

    const comapanyData = companyResponce?.data || [];

    const form = useForm({
        defaultValues: {
            companyName: '',
            representativeName: '',
            email: '',
            phoneNumber: '',
            password: '',
            profile_pic: '',
        },
    });

    const handleViewClick = (company) => {
        setSelected(company);
        setIsViewing(true);
    };

    const handleAddCompany = async (data) => {
        setLoading(true);
        try {
            let profilePicUrl = editingCompany?.profile_pic || '';

            if (data.profilePic && data.profilePic instanceof File) {
                profilePicUrl = await uploadImage(data.profilePic);
            }

            const payload = {
                companyName: data.companyName,
                representativeName: data.representativeName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: data.password,
                profile_pic: profilePicUrl,
            };

            const response = editingCompany
                ? await updateCompany(editingCompany._id, payload)
                : await createCompany(payload);

            if (response?.status === 200) {
                toast({
                    title: editingCompany ? 'Company Updated' : 'Company Added',
                    description: `${data.companyName} ${editingCompany ? 'updated' : 'added'} successfully.`,
                });
                setIsAdding(false);
                setEditingCompany(null);
                form.reset();
                setImageFiles([]);
                queryClient.invalidateQueries({ queryKey: ['company'] });
            }
        } catch (error) {
            console.error('Error saving company:', error);
            toast({
                title: 'Error',
                description: 'Failed to save company. Try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (_id) => {
        setSelectedId(_id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            const response = await deleteCompany(selectedId);
            if (response?.statusCode === 200) {
                toast({ title: 'Deleted', description: 'Company deleted successfully.' });
                await queryClient.invalidateQueries({ queryKey: ['company'] });
            } else {
                toast({ title: 'Error', description: 'Failed to delete company', variant: 'destructive' });
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
        { header: 'Company Name', accessor: (row) => row.companyName || 'Guest User' },
        { header: 'Representative Name', accessor: (row) => row.representativeName },
        { header: 'Email', accessor: (row) => row?.email || 'guest@gmail.com' },
        { header: 'Phone Number', accessor: 'phoneNumber' },
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
                            setEditingCompany(row);
                            setIsAdding(true);
                            form.reset({
                                companyName: row.companyName,
                                representativeName: row.representativeName,
                                email: row.email,
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
                <h1 className="text-2xl font-bold">Company Management</h1>
                <Button
                    onClick={() => {
                        setEditingCompany(null);
                        setIsAdding(true);
                        form.reset({
                            companyName: '',
                            representativeName: '',
                            email: '',
                            phoneNumber: '',
                            password: '',
                            profilePic: ''
                        });
                    }}
                    className="bg-green-600 hover:bg-green-800"
                >
                    Add Company
                </Button>

            </div>

            <Card className="p-4">
                <DataTable
                    data={comapanyData}
                    columns={columns}
                    searchable={true}
                    searchField="companyName"
                    isLoading={isLoading}
                />
            </Card>

            {/* Add & edit Company Dialog */}
            <Dialog
                open={isAdding}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAdding(false);
                        setEditingCompany(null);
                        form.reset();
                    }
                }}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddCompany)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'companyName', label: 'Company Name' },
                                    { name: 'representativeName', label: 'Representative Name' },
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
                                                        form.setValue("profilePic", e.target.files[0]);
                                                    }}
                                                />
                                            </FormControl>
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
                                        setEditingCompany(null);
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
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    )}
                                    {editingCompany ? 'Update Company' : 'Add Company'}
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
                            Are you sure you want to delete this company? This action cannot be undone.
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

            {/* View Company Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Company Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selected?.companyName}
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label>Company Name</Label>
                                    <p className="font-medium">{selected?.companyName}</p>
                                </div>
                                <div>
                                    <Label>Representative Name</Label>
                                    <p className="font-medium">{selected?.representativeName}</p>
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selected?.email}</p>
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <p className="font-medium">{selected?.phoneNumber}</p>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <p className={`font-semibold ${selected.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                        {selected.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selected?.profile_pic && (
                                    <div className="md:col-span-2">
                                        <Label>Profile Picture</Label>
                                        <div className="mt-2">
                                            <img
                                                src={selected?.profile_pic}
                                                alt={selected?.companyName}
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

export default Company;
