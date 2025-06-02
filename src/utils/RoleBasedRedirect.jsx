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
    if (!isLoading && userById?.data?.roleId?.name) {
      const role = userById.data.roleId?.name;

      const rolePath =
        role === "Teacher"
          ? "/teacher"
          : role === "College"
            ? "/college"
            : role === "Company"
              ? "/company"
              : "/admin";

      navigate(rolePath, { replace: true });
    }
  }, [userById, isLoading, navigate]);

  return null;
};

export default RoleBasedRedirect;
