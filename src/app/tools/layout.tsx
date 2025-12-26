export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen h-auto overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  )
}
