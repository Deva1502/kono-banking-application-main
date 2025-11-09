"use client";
import { useMainContext } from "@/context/MainContext";

export default function HeaderName() {
  const { user } = useMainContext();

  if (!user) {
    return (
      <div className="py-2">
        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-5xl font-bold capitalize">{user.name || "User"}</h1>
    </div>
  );
}
