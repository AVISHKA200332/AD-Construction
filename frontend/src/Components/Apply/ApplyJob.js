import React, { useState } from "react";
import { Link } from "react-router-dom";

function ApplyJob() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    coverLetter: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [cvFile, setCvFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.role) return false;
    if (!cvFile) return false; // CV required
    return true;
  };

  const buildEmailText = (cvLink) => {
    return `New Job Application\n\n` +
      `Full Name: ${form.fullName}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || "-"}\n` +
      `Applying For: ${form.role}\n` +
      `Experience: ${form.experience || "-"} years\n\n` +
      `Cover Letter:\n${form.coverLetter || "(none)"}\n\n` +
      `CV: ${cvLink ? cvLink : "(not provided)"}`;
  };

  const uploadCV = async () => {
    if (!cvFile) return null;
    const data = new FormData();
    data.append("file", cvFile);
    // file.io returns a link to download; no API key needed
    const res = await fetch("https://file.io/?expires=1w", {
      method: "POST",
      body: data,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json && (json.link || json.url) ? (json.link || json.url) : null;
  };

  const sendViaEmailJS = async (cvLink) => {
    // Requires configuration: create a free account at emailjs.com and set these env vars
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) return false; // fall back to mailto

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: "avishkadinushan1118@gmail.com",
        applicant_name: form.fullName,
        applicant_email: form.email,
        applicant_phone: form.phone,
        applicant_role: form.role,
        applicant_experience: form.experience,
        applicant_cover_letter: form.coverLetter,
        cv_link: cvLink || "",
        message: buildEmailText(cvLink),
      },
    };

    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validate()) {
      setStatus("Please fill in your name, email, and select a role.");
      return;
    }
    try {
      setSubmitting(true);
      // First upload the CV and get a link
      const cvLink = await uploadCV();

      const sent = await sendViaEmailJS(cvLink);

      if (sent) {
        setStatus("Application sent successfully via email.");
      } else {
        // Fallback: open user's mail client with prefilled content
        const subject = encodeURIComponent(`Job Application - ${form.role} - ${form.fullName}`);
        const body = encodeURIComponent(buildEmailText(cvLink));
        window.location.href = `mailto:avishkadinushan1118@gmail.com?subject=${subject}&body=${body}`;
        setStatus("Opening your email client to send the application.");
      }

      // Optional: reset form
      setForm({ fullName: "", email: "", phone: "", role: "", experience: "", coverLetter: "" });
      setCvFile(null);
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0B3954] via-[#0b3954]/90 to-[#092638] text-white">
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Apply for a Job</h1>
          <Link to="/" className="text-[#F5CB5C] font-semibold hover:underline">← Back to Home</Link>
        </div>

        <p className="text-white/80 mb-8">Fill out the form to apply for Site Manager, Site Supervisor, or Labor positions.</p>

        <form onSubmit={handleSubmit} className="bg-white/95 rounded-xl shadow-xl p-6 text-[#0B3954] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="+94 77 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload CV (PDF, DOC, DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max size depends on your browser and network; if EmailJS is not configured, the file will be uploaded securely and a link will be sent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Apply for role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                required
              >
                <option value="">Select role</option>
                <option value="Site Manager">Site Manager</option>
                <option value="Site Supervisor">Site Supervisor</option>
                <option value="Labor">Labor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                min="0"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="e.g., 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover Letter</label>
            <textarea
              name="coverLetter"
              value={form.coverLetter}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 h-32 resize-y focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="Tell us briefly about your experience and why you're a good fit..."
            />
          </div>

          {status && (
            <div className="text-sm">
              <span className="text-[#0B3954]">{status}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center items-center px-6 py-3 bg-[#F5CB5C] text-[#0B3954] font-semibold rounded-lg shadow hover:bg-[#e5bb4f] transition disabled:opacity-70"
            >
              {submitting ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <Link to="/" className="inline-flex items-center text-[#F5CB5C] font-semibold hover:underline">
            ← Go to Home
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ApplyJob;
