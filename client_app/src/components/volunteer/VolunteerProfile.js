/* eslint-disable react/jsx-newline */
import React, { useEffect, useState } from "react";
import { getVolunteerProfile, updateVolunteerProfile } from "../../api/volunteerProfile";

// Lightweight validators that lint cleanly
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
// Accept 7–15 digits with optional leading + (simple, practical)
const PHONE_REGEX = /^\+?\d{7,15}$/;

export default function VolunteerProfile() {
  const [mode, setMode] = useState("view"); // view | edit
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getVolunteerProfile()
      .then((data) => {
        if (!mounted) return;
        const p = {
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
        };
        setProfile(p);
        setForm(p);
        setLoading(false);
      })
      .catch((e) => {
        setStatus({ type: "error", message: e.message || "Failed to load profile" });
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = () => {
    setForm(profile);
    setMode("edit");
    setStatus(null);
  };

  const cancelEdit = () => {
    setForm(profile);
    setMode("view");
    setStatus(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!EMAIL_REGEX.test(form.email)) return "Please enter a valid email.";
    if (form.phone && !PHONE_REGEX.test(form.phone))
      return "Please enter a valid phone number.";
    return null;
  };

  const save = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setStatus({ type: "error", message: v });
    try {
      setStatus(null);
      const updated = await updateVolunteerProfile(form);
      setProfile(updated);
      setMode("view");
      setStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to update profile" });
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 className="title-small" style={{ marginBottom: "1rem" }}>
        Volunteer Profile
      </h2>

      {status && (
        <div
          className={`message ${status.type}`}
          style={{ marginBottom: 12, padding: 10, borderRadius: 8 }}
        >
          {status.message}
        </div>
      )}

      {mode === "view" ? (
        <div className="card" style={{ padding: 16, borderRadius: 12 }}>
          <div className="list">
            <div>
              <strong>Name:</strong> {profile.name || "—"}
            </div>
            <div>
              <strong>Email:</strong> {profile.email || "—"}
            </div>
            <div>
              <strong>Contact Number:</strong> {profile.phone || "—"}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn m-0" onClick={startEdit}>
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="card" style={{ padding: 16, borderRadius: 12 }}>
          <div className="list">
            <label className="form-label">
              Name
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </label>

            <label className="form-label">
              Email
              <input
                className="form-control"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </label>

            <label className="form-label">
              Contact Number
              <input
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="(optional)"
              />
            </label>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn" type="submit">
              Save
            </button>
            <button className="btn cancel" type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
