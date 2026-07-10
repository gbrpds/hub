import { ReactNode } from "react";

// Layout com slot paralelo @modal: renderiza a página normal (children) e,
// por cima, o modal interceptado quando há uma demanda aberta via soft-nav.
export default function DemandasLayout({
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
