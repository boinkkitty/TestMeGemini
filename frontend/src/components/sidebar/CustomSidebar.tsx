'use client';

import SidebarItem from "./SidebarItem";
import { HiHome, HiOutlineHome } from "react-icons/hi";
import { HiBookOpen, HiOutlineBookOpen } from "react-icons/hi";
import { HiClipboardList, HiOutlineClipboardList } from "react-icons/hi";
import { HiCheckCircle, HiOutlineCheckCircle } from "react-icons/hi";
import { HiLogout, HiOutlineLogout } from "react-icons/hi";

export default function CustomSidebar() {
    const topItems = [
        { text: "Home", icon: <HiOutlineHome size={24} />, activeIcon: <HiHome size={24} />, href: "/dashboard" },
    ];

    const middleItems = [
        { text: "Chapters", icon: <HiOutlineBookOpen size={24} />, activeIcon: <HiBookOpen size={24} />, href: "/chapters" },
        { text: "Quiz", icon: <HiOutlineClipboardList size={24} />, activeIcon: <HiClipboardList size={24} />, href: "/quiz" },
        { text: "Attempts", icon: <HiOutlineCheckCircle size={24} />, activeIcon: <HiCheckCircle size={24} />, href: "/attempts" },
    ];

    const bottomItems = [
        { text: "Log Out", icon: <HiOutlineLogout size={24} />, activeIcon: <HiLogout size={24} />, href: "/logout" },
    ];

    return (
        <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
            <div className="basis-1/3 p-4 border-b border-gray-700">
                {topItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
            </div>

            <div className="basis-1/2 p-4 border-b border-gray-700">
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
