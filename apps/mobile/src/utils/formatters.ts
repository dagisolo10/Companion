export function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        dateStyle: "full",
    });
}

export function formatDateTimeWithTime(date: string | Date) {
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function relativeTime(date: string | Date): string {
    const now = Date.now();
    const then = new Date(date).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return formatDateTime(date);
}

export function getDateString(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateSeparator(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = getDateString(dateStr);
    const todayOnly = getDateString(today.toISOString());
    const yesterdayOnly = getDateString(yesterday.toISOString());

    if (dateOnly === todayOnly) return "Today";
    if (dateOnly === yesterdayOnly) return "Yesterday";

    return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}
