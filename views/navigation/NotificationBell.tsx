"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotificationsController } from "@/controllers/useNotificationsController";

export default function NotificationBell({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotificationsController();

  function toggle() {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      void notifications.reload();
    } else {
      void notifications.markAllAsRead();
    }
  }

  return (
    <div className="notification-menu">
      <button
        className="notification-button"
        type="button"
        aria-label={`Notificações${notifications.unreadCount > 0 ? `, ${notifications.unreadCount} não lidas` : ""}`}
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <span aria-hidden="true">🔔</span>
        {notifications.unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover" role="dialog" aria-label="Notificações">
          <h3>Notificações</h3>
          {notifications.error && <p className="notification-error" role="alert">{notifications.error}</p>}
          {notifications.notifications.length === 0 ? (
            <p className="notification-empty">Nenhuma notificação por enquanto.</p>
          ) : (
            <ul className="notification-list">
              {notifications.notifications.map((item) => {
                const href =
                  item.type === "report_update"
                    ? isAdmin ? "/denuncias" : "/minhas-denuncias"
                    : item.challengeId ? `/jogo?challenge=${item.challengeId}` : null;

                return (
                  <li key={item.id} className={`notification-item ${item.read ? "" : "unread"}`}>
                    <p>{item.message}</p>
                    <div className="notification-item-footer">
                      <time dateTime={item.createdAt}>
                        {new Date(item.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </time>
                      {href && <Link href={href} onClick={() => setIsOpen(false)}>Abrir</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}