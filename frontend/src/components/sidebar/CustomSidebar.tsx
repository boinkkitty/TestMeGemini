'use client';

import SidebarItem from "./SidebarItem";
import { HiHome, HiOutlineHome } from "react-icons/hi";
import { HiBookOpen, HiOutlineBookOpen } from "react-icons/hi";
import { HiClipboardList, HiOutlineClipboardList } from "react-icons/hi";
import { HiCheckCircle, HiOutlineCheckCircle } from "react-icons/hi";
import { HiLogout, HiOutlineLogout } from "react-icons/hi";
import Link from "next/link";
import api from "@/utils/axiosInstance";
import { useRouter } from 'next/navigation'

export default function CustomSidebar() {
    const router = useRouter();

    const topItems = [
        { text: "Home", icon: <HiOutlineHome size={24} />, activeIcon: <HiHome size={24} />, href: "/dashboard" },
    ];

    const middleItems = [
        { text: "Chapters", icon: <HiOutlineBookOpen size={24} />, activeIcon: <HiBookOpen size={24} />, href: "/chapters" },
        { text: "Quiz", icon: <HiOutlineClipboardList size={24} />, activeIcon: <HiClipboardList size={24} />, href: "/quiz" },
        { text: "Attempts", icon: <HiOutlineCheckCircle size={24} />, activeIcon: <HiCheckCircle size={24} />, href: "/attempts" },
    ];

    const bottomItems = [
        {
            text: "Log Out",
            icon: <HiOutlineLogout size={24} />,
            activeIcon: <HiLogout size={24} />,
            href: "/login",
            onClick: async () => {
                try {
                    await api.post("/api/users/logout/");
                    router.push("/login");
                } catch (error) {
                    console.error("Logout failed", error);
                }
            },
        },
    ];

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="basis-1/6 p-4 border-b border-gray-700 flex flex-col gap-4">
                {topItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
                <Link
                    href="/upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center text-lg transition-colors duration-200 shadow-md m-4 hover:cursor-pointer"
                >
                    Upload Notes
                </Link>
            </div>

            <div className="basis-2/3 p-4 border-b border-gray-700">
                {middleItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
            </div>

            <div className="basis-1/6 p-4">
                {bottomItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
            </div>
        </div>
    );
}
