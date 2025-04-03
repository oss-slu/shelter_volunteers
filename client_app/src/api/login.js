import { fetchClient } from "./fetchClient";
export const loginAPI = {
    login: async (username, password) => {
        const response = await fetchClient("/login", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });
        return response
    }
}
