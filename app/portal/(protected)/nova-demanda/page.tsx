import { PageHeader } from "@/components/ui/PageHeader";
import { ChecklistIcon, ClockIcon } from "@/components/ui/icons";
import { NewDemandForm } from "./NewDemandForm";

const BRIEFING_TIPS = [
  { title: "Contexto", text: "Conte a ocasião ou o que está acontecendo." },
  { title: "Mensagem principal", text: "O que não pode faltar no conteúdo?" },
  { title: "Tom de voz", text: "Sério, divertido, informativo, elegante..." },
  { title: "Referências", text: "Mande exemplos de coisas que você gosta." },
  { title: "Prazo", text: "Quando você precisa disso pronto?" },
];

const TIME_TABLE = [
  { type: "Post", time: "1 a 2 dias" },
  { type: "Carrossel", time: "2 a 3 dias" },
  { type: "Reels", time: "3 a 4 dias" },
  { type: "Story", time: "1 dia" },
  { type: "Vídeo longo", time: "5 a 7 dias" },
];

export default function NovaDemandaPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Nova demanda"
        description="Preencha os detalhes e a gente cuida do resto."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <NewDemandForm />

        <aside className="flex flex-col gap-6">
          <section className="rounded border border-border bg-surface p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
              <span className="text-accent">
                <ChecklistIcon width={16} height={16} />
              </span>
              Como pedir um bom conteúdo
            </h2>
            <ul className="flex flex-col gap-3">
              {BRIEFING_TIPS.map((tip) => (
                <li key={tip.title}>
                  <p className="text-sm font-semibold text-foreground">
                    {tip.title}
                  </p>
                  <p className="text-xs text-muted">{tip.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded border border-border bg-surface p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
              <span className="text-accent">
                <ClockIcon width={16} height={16} />
              </span>
              Quanto tempo leva
            </h2>
            <ul className="flex flex-col gap-2">
              {TIME_TABLE.map((row) => (
                <li
                  key={row.type}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{row.type}</span>
                  <span className="text-muted">{row.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted">
              Prazos são estimativas e podem variar conforme a fila.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
