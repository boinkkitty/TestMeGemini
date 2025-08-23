import {usePathname} from "next/navigation";
import Link from "next/link";

type SidebarItemProps = {
    text: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    href: string;
    onClick?: () => void; // optional click handler for custom actions
};

function SidebarItem({ text, icon, activeIcon, href, onClick }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    const baseClasses = `w-full flex items-center gap-3 rounded-md p-2 mb-2 transition-colors duration-300 ease-in-out
        hover:bg-gray-100 hover:opacity-100 enabled:hover:cursor-pointer disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-gray-300
        ${isActive ? "bg-gray-100 border-l-4 border-gray-400" : "bg-transparent"}`;

    const iconClasses = `${isActive ? "text-gray-700" : "text-slate-400"}`;
    const textClasses = `text-lg font-medium ${isActive ? "text-gray-800" : "text-slate-400"}`;

    if (onClick) {
        return (
            <button className={baseClasses} onClick={onClick}>
                <span className={iconClasses}>{isActive ? activeIcon : icon}</span>
                <span className={textClasses}>{text}</span>
            </button>
        );
    }

    return (
        <Link href={href} className={baseClasses}>
            <span className={iconClasses}>{isActive ? activeIcon : icon}</span>
            <span className={textClasses}>{text}</span>
        </Link>
    );
}

export default SidebarItem;