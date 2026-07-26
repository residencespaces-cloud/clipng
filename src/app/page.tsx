import type { Metadata } from "next";
import { Landing } from "@/app/features/landing/Landing";
import { JsonLd } from "@/app/components/seo/JsonLd";
import { listLive } from "@/server/services/campaigns.service";
import type { Campaign } from "@/app/types";

const SITE_URL = "https://kudiclip.com";
const DESCRIPTION =
  "Nigerian campaigns. Naira payouts. No follower minimum. Clip Afrobeats drops, skits, and brand content — earn per every 1,000 views on KudiClip.";

export const metadata: Metadata = {
  title: {
    absolute: "KudiClip — Get Paid to Clip",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KudiClip — Get Paid to Clip",
    description: DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    title: "KudiClip — Get Paid to Clip",
    description: DESCRIPTION,
  },
};

export default async function HomePage() {
  let campaigns: Campaign[] = [];
  try {
    campaigns = (await listLive()).slice(0, 8);
  } catch {
    campaigns = [];
  }

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "KudiClip",
            url: SITE_URL,
            logo: `${SITE_URL}/icon.svg`,
            description: DESCRIPTION,
            areaServed: {
              "@type": "Country",
              name: "Nigeria",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "KudiClip",
            url: SITE_URL,
            description: DESCRIPTION,
            inLanguage: "en-NG",
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "KudiClip",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: SITE_URL,
            description: DESCRIPTION,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "NGN",
            },
            audience: {
              "@type": "Audience",
              geographicArea: {
                "@type": "Country",
                name: "Nigeria",
              },
            },
          },
        ]}
      />
      <Landing campaigns={campaigns} />
    </>
  );
}
