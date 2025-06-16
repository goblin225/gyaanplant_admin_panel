import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "@/components/common/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { getUserById, updateProfile } from "../services/user";
import { uploadImage } from '../services/upload';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthProvider";

const ProfileSettings = () => {

    const { toast } = useToast();
    const { user } = useAuth();
    const userId = user?._id;

    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState("");
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { isSubmitting }
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
            phoneNumber: '',
            profile_pic: ''
        }
    });

    const profile_pic = watch("profile_pic");

    const { data: userData } = useQuery({
        queryKey: ["userById", userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });

    useEffect(() => {
        if (userData?.data) {
            const { name, email, phoneNumber, profile_pic } = userData.data;

            reset({
                name: name || "",
                email: email || "",
                phoneNumber: phoneNumber || "",
                profile_pic: profile_pic || ""
            });

            setPreview(profile_pic || "");
            sessionStorage.setItem("userData", JSON.stringify(userData.data));
        }
    }, [userData, reset]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadedUrl = await uploadImage(file);
            setValue('profile_pic', uploadedUrl);
            setPreview(uploadedUrl);
            toast({ title: "Success", description: "Image uploaded successfully" });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setValue("profile_pic", "");
        setPreview("");
        toast({ title: "Removed", description: "Profile image removed" });
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                profile_pic: data.profile_pic
            };

            console.log("Payload:", payload);

            const updated = await updateProfile(userId, payload);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast({
                title: 'Profile updated',
                description: 'Profile updated successfully',
            });
            toast.success("");
            queryClient.invalidateQueries(["userById", userId]);
            sessionStorage.setItem("userData", JSON.stringify(updated.data));
        } catch {
            toast({
                title: 'Something went wrong',
                description: response.data.message || 'Failed to process profile',
                variant: 'destructive'
            });
        }
    };

    return (
        <Card title="Profile Information" description="Update your account profile information">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Avatar className="h-20 w-20 relative">
                        <AvatarImage src={preview || profile_pic} alt="Profile" />
                        <AvatarFallback>
                            {userData?.data?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Profile picture</h4>
                        <p className="text-sm text-muted-foreground">Upload or remove your photo</p>
                        {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                        <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2" />
                        {preview && (
                            <Button className="bg-red-200 text-red-800" type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                                Remove Image
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name" {...register("name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Email" {...register("email")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Phone Number" {...register("phoneNumber")} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-800">
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ProfileSettings;