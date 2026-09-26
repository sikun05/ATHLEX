import {
  Activity, BadgePercent, BarChart3, Bell, CalendarCheck, CalendarDays, ClipboardList, CreditCard, Dumbbell, FileText, Gauge, Image, Inbox, LayoutDashboard,
  MessageSquareQuote, Megaphone, QrCode, ScanLine, Settings, Ticket, UserCog, UserRound, Users, Utensils, WalletCards, type LucideIcon,
} from "lucide-react";

/** Only the icons the dashboards use — keeps the client bundle small. */
export const NAV_ICONS = {
  Activity, BadgePercent, BarChart3, Bell, CalendarCheck, CalendarDays, ClipboardList, CreditCard, Dumbbell, FileText, Gauge, Image, Inbox, LayoutDashboard,
  MessageSquareQuote, Megaphone, QrCode, ScanLine, Settings, Ticket, UserCog, UserRound, Users, Utensils, WalletCards,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof NAV_ICONS;
