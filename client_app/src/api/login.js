import { fetchClient } from "./fetchClient";
export const loginAPI = {
    login: async (token) => {
        const response = await fetchClient("/login", {
            method: "POST",
            body: JSON.stringify({
                idToken: token
            }),
        });
        return response
    }
}
