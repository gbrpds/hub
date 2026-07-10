import { ReactNode } from "react";

// Slot paralelo @modal: o detalhe da demanda abre como popup sobre a lista.
export default function PortalDemandasLayout({
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
