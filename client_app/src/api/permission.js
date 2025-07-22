import { fetchClient } from "./fetchClient";

export const permissionsAPI = {
  getPermissions: async () => {
    const response = await fetchClient("/user_permission");
    return response;
  },
  addPermission: async (data) => {
    const response = await fetchClient("/user_permission", { // <-- changed here
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },
  deletePermission: async (permissionId) => {
    const response = await fetchClient(`/user_permissions/${permissionId}`, {
      method: "DELETE",
    });
    return response;
  },
  getSystemAdmins: async () => {
    const response = await fetchClient("/system_admin");
    return response;
  },
  getShelterAdmins: async (shelterId) => {
    const response = await fetchClient(`/shelter_admin?shelter_id=${shelterId}`);
    return response;
  }
};
