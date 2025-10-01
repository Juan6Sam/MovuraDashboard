export default function Badge({ children, color = "gray" }: any) {
  const styles: any = {
    gray: "bg-gray-100 text-gray-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${styles[color] || styles.gray}`}>{children}</span>;
}
