import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CTAButton } from "@/components/framer/CTAButton";
import { TributeStack } from "@/components/framer/TributeStack";

const biographyParagraphs = [
  "Madam Monica Manu, affectionately known as Auntie Monica, was born in 1954 in Kumasi, Ghana. She lived a life of devotion, service, and love that spanned seventy-one remarkable years until her peaceful passing on the 6th of June, 2025.",
  "She began her education at Achiase near Asuofua and later trained at Mancels Commercial and Business School. Although she studied sewing, Monica’s entrepreneurial spirit led her into the world of vibrant marketplaces where she built a reputable trading career.",
  "Soon after completing her education she married Mr. Joseph Lawrence Asiwbour — Teacher Asiwbour — and together they raised six children. Their union was marked by mutual respect, faith, and dedication to family life, travelling whenever his calling took a new direction.",
  "Monica was a pillar in her community; prayerful, fair, and full of warmth. Her home was a sanctuary of hospitality and strength, welcoming relatives from near and far, guiding them with wise counsel, and holding space for every generation.",
];

const galleryImages = [
  {
    src: "https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151",
    caption: "Agya Koo performing live at the farewell of Madam Monica Manu.",
  },
  {
    src: "https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140",
    caption: "Mourners in red and black at the farewell of Madam Monica Manu.",
  },
  {
    src: "https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153",
    caption: "Moments of song and remembrance for Madam Monica Manu.",
  },
];

const tributes = [
  {
    name: "Mercy Asiwbour",
    relationship: "Daughter",
    message: "You held our family together with grace. Your prayers continue to light the way for us all.",
  },
  {
    name: "Samuel & Georgina",
    relationship: "Grandchildren",
    message: "Grandma, your songs still echo in the house. We promise to keep your storytelling alive.",
  },
  {
    name: "Teacher Asiwbour",
    relationship: "Husband",
    message: "For five decades you stood by me. Rest, my love, knowing your legacy lives on in every heart you touched.",
  },
  {
    name: "Grace and family",
    relationship: "Family Friend",
    message: "Your hospitality welcomed us at every celebration. We cherish the memories of your radiant smile.",
  },
  {
    name: "Kwadwo & Afua",
    relationship: "In-law",
    message: "Thank you for showing us what humility, strength, and unwavering faith truly look like.",
  },
  {
    name: "The All Nations Choir",
    relationship: "Choir",
    message: "We will sing your favourite hymns in your honour, as you always requested with joyful tears.",
  },
];

const MonicaManu = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col pb-24 pt-28 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <SectionHeader
            eyebrow="Tribute Memoir"
            title="The life of Madam Monica Manu"
            description="A matriarch whose faith, generosity, and entrepreneurial spark inspired a community spanning generations."
            align="center"
          />
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="glass-panel rounded-[32px] border border-white/10 p-8 md:p-12">
            <div className="space-y-6 text-subtle">
              {biographyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.3em] text-subtle">
                Last updated 05 Nov 2025
              </p>
              <CTAButton to="/contact#hero" label="Commission a memoir" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeader
            eyebrow="Highlights"
            title="Scenes from Monica's celebration"
            description="A glimpse into the performances, colours, and gathering that marked her farewell."
            align="center"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {galleryImages.map((image) => (
              <figure key={image.src} className="glass-panel overflow-hidden rounded-3xl border border-white/10">
                <img src={image.src} alt={image.caption} className="h-80 w-full object-cover" loading="lazy" />
                <figcaption className="p-4 text-sm text-subtle">{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeader
            eyebrow="Tributes"
            title="Messages from those she loved"
            description="Voices of gratitude and remembrance shared during the celebration."
            align="center"
          />
          <TributeStack tributes={tributes} className="mt-12" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MonicaManu;

