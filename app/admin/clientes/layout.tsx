import { ReactNode } from "react";

// Slot paralelo @modal: a ficha do cliente abre como popup sobre a lista.
export default function ClientesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
