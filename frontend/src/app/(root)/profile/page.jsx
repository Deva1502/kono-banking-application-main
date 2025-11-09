"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMainContext } from "@/context/MainContext";

export default function ProfilePage() {
  const { user, fetchUserProfile } = useMainContext();
  const router = useRouter();

  // Ensure fresh profile on first mount
  useEffect(() => {
    fetchUserProfile && fetchUserProfile();
  }, [fetchUserProfile]);

  // Redirect unauthenticated to login
  useEffect(() => {
    if (user === null) return; // still loading from provider
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const avatar = user.avatarUrl || "https://ui-avatars.com/api/?name=User&background=EEE&color=111";

  return (
    <div className="w-[98%] lg:w-[80%] mx-auto py-6">
      {/* Header */}
      <section className="flex items-center gap-4 py-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border">
          <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold capitalize">{user.name || "User"}</h1>
          <p className="text-gray-600 text-sm">{user.email}</p>

          {/* Add the Edit link here */}
          <div className="mt-2">
            <a href="/profile/edit" className="inline-block text-sm text-rose-600 hover:underline">
              Edit profile
            </a>
          </div>
        </div>
      </section>
      
      <section className="flex items-center gap-4 py-4">
        {/* <div className="h-16 w-16 rounded-full overflow-hidden border">
          <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
        </div> */}
        <div>
          <h1 className="text-2xl font-semibold capitalize">{user.name || "User"}</h1>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </section>

      {/* Details */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Profile details</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" value={user.name} />
              <Field label="Email" value={user.email} />
              <Field label="Phone" value={user.phone} />
              <Field label="Date of birth" value={formatDate(user.dob)} />
              <Field label="User ID" value={user._id} />
              <Field label="Status" value={user.status || "Active"} />
              <Field label="Role" value={user.role} />
              <Field label="KYC Status" value={user.kycStatus} />
            </div>

            <div className="mt-6">
              <Field label="Address" value={user.address} full />
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1 space-y-4">
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-3">Account summary</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Joined: {formatDate(user.createdAt) || "—"}</li>
              <li>Last login: {formatDate(user.lastLoginAt) || "—"}</li>
              <li>Accounts: {Array.isArray(user.accounts) ? user.accounts.length : 0}</li>
            </ul>
          </div>

          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-3">Linked identifiers</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Phone verified: {boolToText(user.phoneVerified)}</li>
              <li>Email verified: {boolToText(user.emailVerified)}</li>
              <li>KYC verified: {boolToText(user.kycVerified)}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Optional: show accounts if you enrich user with them */}
      {Array.isArray(user.accounts) && user.accounts.length > 0 && (
        <section className="border rounded p-4 mt-8">
          <h3 className="text-lg font-semibold mb-3">Accounts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Account No</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Balance</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {user.accounts.map((acc) => (
                  <tr key={acc._id || acc.accountNumber} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{acc.accountNumber || acc._id || "—"}</td>
                    <td className="py-2 pr-4 capitalize">{acc.ac_type || acc.type || "—"}</td>
                    <td className="py-2 pr-4">{formatCurrency(acc.amount ?? acc.balance, acc.currency || "INR")}</td>
                    <td className="py-2 pr-4">{acc.status || "Active"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-base">{value || "—"}</p>
    </div>
  );
}

function formatDate(d) {
  try {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    return date.toDateString();
  } catch {
    return "";
  }
}

function boolToText(v) {
  return v ? "Yes" : "No";
}

function formatCurrency(amount, currency = "INR") {
  if (typeof amount !== "number") return "—";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount}`;
  }
}
