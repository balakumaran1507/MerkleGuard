import React from "react"

export function LoadingSpinner({ size = "md" }) {
  const dim = { sm: 16, md: 28, lg: 40 }[size] ?? 28
  const stroke = { sm: 2, md: 2.5, lg: 3 }[size] ?? 2.5

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          border: `${stroke}px solid var(--color-border-default)`,
          borderTopColor: "var(--color-cyan-500)",
        }}
        className="animate-mg-spin"
      />
    </div>
  )
}
