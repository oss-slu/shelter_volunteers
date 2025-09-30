// client_app/src/api/volunteerProfile.js
import { fetchClient } from "./fetchClient";

export async function getVolunteerProfile() {
  const res = await fetchClient("/volunteer/profile", { method: "GET" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateVolunteerProfile(payload) {
  const res = await fetchClient("/volunteer/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}
