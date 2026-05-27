import { SectionHeader } from "@/components/framer/SectionHeader";
import { BeizaCircleMark } from "@/components/family-trees/BeizaCircleMark";
import { ADINKRA_SYMBOLS } from "@/lib/adinkra";

type CulturalSymbol = {
  id: string;
  name: string;
  meaning: string;
};

const GHANA_BLACK_STAR: CulturalSymbol = {
  id: "ghana-black-star",
  name: "Black Star (Ghana)",
  meaning:
    "African emancipation and Pan-African unity — a lodestar of freedom that represents Ghana’s vanguard role in liberation.",
};

export function AdinkraSymbolsListSection() {
  const symbols: CulturalSymbol[] = [
    // Ghana first: this is the “obviously Ghana” anchor before Adinkra.
    GHANA_BLACK_STAR,
    ...ADINKRA_SYMBOLS.map((s) => ({ id: s.id, name: s.name, meaning: s.meaning })),
  ];

  return (
    <section id="symbols" className="scroll-mt-24 mx-auto w-full max-w-6xl px-6">
      <div className="bg-black py-10">
        <SectionHeader
          eyebrow="ADINKRA SYMBOLS"
          title="Symbols that turn memory into legacy"
          description="Pick a symbol. Record one voice memory that answers what it means in your family."
          align="left"
          variant="dark"
        />

        <div
          className="mt-7 grid gap-5 min-[810px]:grid-cols-2 min-[1200px]:grid-cols-4"
        >
          {symbols.map((symbol) => (
            <article key={symbol.id} className="min-h-[88px] p-1">
              <div className="flex items-start gap-3">
                <BeizaCircleMark size={28} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{symbol.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {symbol.meaning}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

