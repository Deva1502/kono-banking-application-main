"use client";
import React, { useState } from "react";

export default function ProfileCard({
  user = { name: "Devansh Mishra", email: "devansh@example.com", phone: "+91-98xxxxxx12" },
  accounts = [
    { id: "SAV-001", type: "Savings", balance: 52340.75 },
    { id: "CUR-002", type: "Current", balance: 12000.0 },
  ],
  recent = [
    { id: 1, desc: "Grocery Store", date: "2025-11-07", amount: -1200 },
    { id: 2, desc: "Salary", date: "2025-11-01", amount: 45000 },
  ],
}) {
  const [showBalance, setShowBalance] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const maskedBalance = (v) =>
    v
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, (m, i, s) => (s.length - i > 6 ? "•" : m)); // simple mask

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold">
              {user.name.split(" ").map(n => n[0]).slice(0,2).join("")}
            </div>
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-sm text-gray-500">Phone: {user.phone.replace(/(\d{2})(\d{4})(\d{2})/, "$1-xxxx-$3")}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Total accounts</div>
            <div className="text-2xl font-semibold">{accounts.length}</div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Aggregate balance</div>
                <div className="text-2xl font-semibold mt-1">
                  {showBalance ? `₹ ${totalBalance.toLocaleString("en-IN", {minimumFractionDigits:2})}` : `₹ ${maskedBalance(totalBalance)}`}
                </div>
              </div>
              <button
                aria-label="Toggle balance visibility"
                onClick={() => setShowBalance((s) => !s)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {showBalance ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">View Accounts</button>
              <button className="px-4 py-2 border rounded">Transfer</button>
              <button className="px-4 py-2 border rounded">Add Account</button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Primary account</div>
            <div className="mt-1 font-medium">XXXX-XXXX-{accounts[0].id.slice(-3)}</div>

            <div className="mt-4 text-sm text-gray-500">KYC status</div>
            <div className="mt-1 inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Verified</div>

            <div className="mt-4 text-sm text-gray-500">Recent activity</div>
            <ul className="mt-2 space-y-2">
              {recent.map(tx => (
                <li key={tx.id} className="flex justify-between text-sm">
                  <span>{tx.desc} • <span className="text-gray-400">{tx.date}</span></span>
                  <span className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {tx.amount < 0 ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN', {minimumFractionDigits:2})}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t pt-4 flex justify-end gap-2">
          <button className="px-3 py-2 border rounded">Manage Security</button>
          <button className="px-3 py-2 border rounded">Logout</button>
        </div>
      </div>
    </div>
  );
}
