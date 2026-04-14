"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api/token";
import { getUnreadCount } from "@/lib/api/notification";

type NotificationContextType = {
    unreadCount: number;
    refreshUnreadCount: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
    unreadCount: 0,
    refreshUnreadCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(() => {
        if (!getAccessToken()) return;
        getUnreadCount().then(setUnreadCount).catch(() => setUnreadCount(0));
    }, []);

    useEffect(() => {
        refreshUnreadCount();
    }, [refreshUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}
