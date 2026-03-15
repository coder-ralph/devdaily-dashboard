import React from 'react'

export default function WidgetCard({ icon, title, badge, headerRight, children, className = '' }) {
  return (
    <div className={`widget-card ${className}`}>
      <div className="widget-header">
        <div className="widget-title">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {badge && <span className="widget-badge">{badge}</span>}
        </div>
      </div>
      {/* Body text inherits from html color which switches per theme */}
      <div className="p-4">{children}</div>
    </div>
  )
}
