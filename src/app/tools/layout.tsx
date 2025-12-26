export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  )
}
