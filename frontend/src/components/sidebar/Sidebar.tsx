'use client';

import SidebarItem from "./SidebarItem";
import {
    HomeIcon,
    BookOpenIcon,
    ClipboardListIcon,
    CheckCircleIcon,
    LogOutIcon,
    LayersIcon,
} from "lucide-react";
import Link from "next/link";
import api from "@/utils/axiosInstance";
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();

    const topItems = [
        { text: "Dashboard", icon: <HomeIcon size={18} />, href: "/dashboard" },
    ];

    const middleItems = [
        { text: "Chapters", icon: <BookOpenIcon size={18} />, href: "/chapters" },
        { text: "Quiz", icon: <ClipboardListIcon size={18} />, href: "/quiz" },
        { text: "Attempts", icon: <CheckCircleIcon size={18} />, href: "/attempts" },
    ];

    const bottomItems = [
        {
            text: "Log Out",
            icon: <LogOutIcon size={18} />,
            href: "/login",
            onClick: async () => {
                await api.post("/api/users/logout/")
                    .catch((error) => console.error("Logout failed", error))
                    .finally(() => router.push("/login"));
            },
        },
    ];

    return (
        <div className="sticky top-0 h-screen w-58 bg-white border-r border-border flex flex-col">

            {/* Logo + upload CTA */}
            <div className="px-4 pt-5 pb-4 border-b border-border flex flex-col gap-3">
                <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <LayersIcon size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        TestMeGemini
                    </span>
                </Link>
                <Link
                    href="/upload"
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-150"
                >
                    + Upload Notes
                </Link>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                    Navigation
                </span>
                {topItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
                {middleItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
            </nav>

            {/* Bottom: logout */}
            <div className="px-2 pb-4 pt-2 border-t border-border flex flex-col gap-1">
                {bottomItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} />
                ))}
            </div>
        </div>
    );
}
