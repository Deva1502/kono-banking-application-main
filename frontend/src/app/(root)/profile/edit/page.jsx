"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMainContext } from "@/context/MainContext";
import { axiosClient } from "@/utils/AxiosClient";
import { toast } from "react-toastify";
import CustomAuthButton from "@/components/reuseable/CustomAuthButton";

export default function EditProfilePage() {
  const { user, fetchUserProfile } = useMainContext();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    dob: "",
    address: "",
    role: "",
    status: "Active",
    kycStatus: "",
    emailVerified: false,
    phoneVerified: false,
    kycVerified: false,
    avatarUrl: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      dob: user.dob ? user.dob.substring(0, 10) : "",
      address: user.address || "",
      role: user.role || "",
      status: user.status || "Active",
      kycStatus: user.kycStatus || "",
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.phoneVerified,
      kycVerified: !!user.kycVerified,
      avatarUrl: user.avatarUrl || ""
    });
  }, [user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dob) delete payload.dob;
      const res = await axiosClient.put("/auth/profile", payload, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      await res.data;
      toast.success("Profile updated");
      await fetchUserProfile();
      router.push("/profile");
    } catch (err) {
      toast.error(err?.response?.data?.msg || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-[98%] lg:w-[80%] mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-4">Edit profile</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" name="name" value={form.name} onChange={onChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={onChange} placeholder="+91-XXXXXXXXXX" />
          <Input label="Date of birth" type="date" name="dob" value={form.dob} onChange={onChange} />
          <Input label="Role" name="role" value={form.role} onChange={onChange} />
          <Input label="Status" name="status" value={form.status} onChange={onChange} />
          <Input label="KYC Status" name="kycStatus" value={form.kycStatus} onChange={onChange} />
          <Input label="Avatar URL" name="avatarUrl" value={form.avatarUrl} onChange={onChange} placeholder="https://..." />
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Address</label>
            <textarea name="address" value={form.address} onChange={onChange} rows={3} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Checkbox label="Email verified" name="emailVerified" checked={form.emailVerified} onChange={onChange} />
          <Checkbox label="Phone verified" name="phoneVerified" checked={form.phoneVerified} onChange={onChange} />
          <Checkbox label="KYC verified" name="kycVerified" checked={form.kycVerified} onChange={onChange} />
        </div>

        <div className="flex items-center gap-3">
          <CustomAuthButton isLoading={saving} text="Save changes" />
          <button type="button" onClick={() => router.push("/profile")} className="px-4 py-2 border rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input {...props} className="w-full border rounded px-3 py-2" />
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" {...props} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
