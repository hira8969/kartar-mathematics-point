import http from "./http";

const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export const certificateService = {
  getEligible: () => http.get("/certificates/eligible").then((response) => response.data),
  getIssued: () => http.get("/certificates/issued").then((response) => response.data),
  issue: (payload) => http.post("/certificates/issue", payload).then((response) => response.data),
  updateStatus: (id, payload) => http.patch(`/certificates/${id}/status`, payload).then((response) => response.data),
  getMine: () => http.get("/certificates/me").then((response) => response.data),
  verify: (certificateNumber) => http.get(`/certificates/verify/${encodeURIComponent(certificateNumber)}`).then((response) => response.data),
  downloadPdf: (id) => http.get(`/certificates/${id}/pdf`, { responseType: "blob" }).then((response) => response.data),
  downloadPublicPdf: (certificateNumber) => fetch(`${apiBase}/certificates/verify/${encodeURIComponent(certificateNumber)}/pdf`).then(async (response) => {
    if (!response.ok) {
      throw new Error("Unable to download certificate PDF");
    }
    return response.blob();
  })
};
