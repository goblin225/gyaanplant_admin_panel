import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../services/user";
import { useAuth } from "../context/AuthProvider";

const RoleBasedRedirect = () => {

    const { user } = useAuth();
    const userId = user?._id;
    const navigate = useNavigate();

    const { data: userById, isLoading, error } = useQuery({
        queryKey: ["userById", userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    });

    useEffect(() => {
        if (!isLoading && userById?.data?.role) {
            const rolePath = userById?.data?.role === "Teacher" ? "/Teacher" : "/Admin";
            navigate(rolePath, { replace: true });
        }
    }, [userById, isLoading, navigate]);

    return null;
};

export default RoleBasedRedirect;