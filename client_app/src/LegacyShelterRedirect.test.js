import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LegacyShelterRedirect from "./LegacyShelterRedirect";

function ShowLocation() {
  const { pathname, search, hash } = useLocation();
  return <p data-testid="location">{`${pathname}${search}${hash}`}</p>;
}

function renderAt(url) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/shelter/*" element={<LegacyShelterRedirect />} />
        <Route path="*" element={<ShowLocation />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.getByTestId("location").textContent;
}

describe("legacy /shelter URLs", () => {
  it.each([
    ["/shelter", "/"],
    ["/shelter/", "/"],
    ["/shelter/home", "/"],
    ["/shelter/home#sign-in", "/#sign-in"],
    ["/shelter/admin-login", "/admin-login"],
    ["/shelter/volunteer-dashboard/upcoming-shifts?x=1", "/volunteer-dashboard/upcoming-shifts?x=1"],
    ["/home", "/"],
  ])("%s redirects to %s", (from, to) => {
    expect(renderAt(from)).toBe(to);
  });

  it("leaves /shelter-dashboard routes alone", () => {
    expect(renderAt("/shelter-dashboard/abc/settings")).toBe("/shelter-dashboard/abc/settings");
  });
});
