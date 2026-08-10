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
import { useEffect, useState } from "react";
import { getUserInfo } from "@/services/users";
import { UserInfo } from "@/lib/types";

export default function Sidebar() {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        getUserInfo().then(setUser).catch(() => null);
    }, []);

    const topItems = [
        { text: "Dashboard", icon: <HomeIcon size={18} />, href: "/dashboard" },
    ];

    const middleItems = [
        { text: "Chapters", icon: <BookOpenIcon size={18} />, href: "/chapters" },
        { text: "Quiz", icon: <ClipboardListIcon size={18} />, href: "/quiz" },
        { text: "Attempts", icon: <CheckCircleIcon size={18} />, href: "/attempts" },
    ];

    const handleLogout = async () => {
        await api.post("/api/v1/auth/logout/")
            .catch((error) => console.error("Logout failed", error))
            .finally(() => router.push("/login"));
    };

    const initials = user?.username
        ? user.username.slice(0, 1).toUpperCase()
        : "?";

    return (
        <div className="fixed top-0 left-0 bottom-0 h-screen w-[232px] bg-card border-r border-border flex flex-col z-10">

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

            {/* Bottom: logout + user chip */}
            <div className="px-2 pb-4 pt-2 border-t border-border flex flex-col gap-1">
                <SidebarItem
                    text="Log Out"
                    icon={<LogOutIcon size={18} />}
                    href="/login"
                    onClick={handleLogout}
                />
                {user && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-md">
                        <div className="w-7 h-7 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                                {user.username}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate leading-tight">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
