"use client";
import Link from "next/link";
import { useMemo } from "react";
import HeaderName from "@/components/HeaderName";
import { useMainContext } from "@/context/MainContext";
import { BsCoin } from "react-icons/bs";
import { RiCoinsLine } from "react-icons/ri";
import { IoCardSharp } from "react-icons/io5";
import StatCard from "./stat-card";

export default function HomePage() {
  const { user } = useMainContext();

  const accounts = Array.isArray(user?.account_no) ? user.account_no : [];
  const atms = Array.isArray(user?.atms) ? user.atms : [];
  const fdAmount = typeof user?.fd_amount === "number" ? user.fd_amount : 0;

  const totalAmount = useMemo(() => {
    if (!accounts.length) return 0;
    return accounts.map((a) => Number(a?.amount || 0)).reduce((sum, v) => sum + v, 0);
  }, [accounts]);

  const stats = [
    {
      title: "Amount",
      value: totalAmount,
      href: "/amount",
      icon: <BsCoin className="text-4xl text-yellow-600" />,
      accent: "from-yellow-100 to-yellow-50",
      chip: "INR",
    },
    {
      title: "FD Amount",
      value: fdAmount,
      href: "/fd-amount",
      icon: <RiCoinsLine className="text-4xl text-rose-600" />,
      accent: "from-rose-100 to-rose-50",
      chip: "FD",
    },
    {
      title: "ATM Cards",
      value: atms.length,
      href: "/atm-cards",
      icon: <IoCardSharp className="text-4xl text-indigo-600" />,
      accent: "from-indigo-100 to-indigo-50",
      chip: "Cards",
      isCurrency: false,
    },
  ];

  return (
    <div className="py-8 space-y-6">
      <HeaderName />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/profile" className="text-rose-700 hover:underline">
          View profile
        </Link>
        <Link href="/transactions" className="text-gray-700 hover:underline">
          Recent transactions
        </Link>
        <Link href="/fd-amount" className="text-gray-700 hover:underline">
          Fixed deposits
        </Link>
      </div>
    </div>
  );
}
