export function Loading() {
  return <p role="status" className="label page-pad py-40 text-neutral-500">Loading…</p>;
}
export function ErrorMsg({ message }: { message: string }) {
  return <p role="alert" className="page-pad py-40 text-sm text-red-700">Could not load this page: {message}</p>;
}
export function Empty({ children = 'Nothing to show yet.' }: { children?: React.ReactNode }) {
  return <p className="label page-pad py-24 text-neutral-500">{children}</p>;
}
