import { fetchClient } from "./fetchClient";

export const serviceCommitmentAPI = {
    getCommitments: async () => {
        const response = await fetchClient(`/service_commitment`);
        return response;
    },
    getFutureCommitments: async () => {
        // sends a GET request to /service_commitment endpoint
        // passing the current time (in milliseconds since epoch) as a
        // value for the filter_start_after query parameter
        const timeNow = Date.now();
        const response = await fetchClient(
            `/service_commitment?filter_start_after=${timeNow}`
        );
        return response;
    },
    getPastCommitments: async() => {
        // sends a GET request to /service_commitment endpoint
        // passing the current time (in milliseconds since epoch) as a
        // value for the filter_start_before query parameter
        const timeNow = Date.now();
        const response = await fetchClient(
            `/service_commitment?filter_start_before=${timeNow}`
        );
        return response;
    },
    addCommitments: async (data) => {
        console.log("Adding commitment", data);
        const response = await fetchClient("/service_commitment", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    },
};