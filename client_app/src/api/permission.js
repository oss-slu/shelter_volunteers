import { fetchClient } from "./fetchClient";

export const permissionsAPI = {
    getPermissions: async() => {
        const response = await fetchClient("/user_permission");
        return response;
    },
    addPermission: async(data) => {
        const response = await fetchClient("/user_permissions", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    },
    deletePermission: async(permissionId) => {
        const response = await fetchClient(`/user_permissions/${permissionId}`, {
            method: "DELETE",
        });
        return response;
    },
};