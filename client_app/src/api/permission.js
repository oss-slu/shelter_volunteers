import { fetchClient } from "./fetchClient";

export const permissionsAPI = {
  getPermissions: async () => {
    const response = await fetchClient("/user_permission");
    return response;
  },
  addShelterAdmin: async (shelterId, userEmail) => {
    const response = await fetchClient(`/shelters/${shelterId}/admin`, {
      method: "POST",
      body: JSON.stringify({ user_email: userEmail }),
    });
    return response;
  },
  deleteShelterAdmin: async (shelterId, userEmail) => {
    const response = await fetchClient(`/shelters/${shelterId}/admin`, {
      method: "DELETE",
      body: JSON.stringify({ user_email: userEmail }),
    });
    return response;
  },
  addSystemAdmin: async (userEmail) => {
    const response = await fetchClient("/system_admin", {
      method: "POST",
      body: JSON.stringify({ user_email: userEmail }),
    });
    return response;
  },
  deleteSystemAdmin: async (userEmail) => {
    const response = await fetchClient("/system_admin", {
      method: "DELETE",
      body: JSON.stringify({ user_email: userEmail }),
    });
    return response;
  },
  /*
  addPermission: async (data) => {
    const response = await fetchClient("/user_permission", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },
  */
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
    const response = await fetchClient(`/shelters/${shelterId}/admin`);
    return response;
  }
};
