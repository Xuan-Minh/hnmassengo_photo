import Providers from "../../providers";
import { notFound } from "next/navigation";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import de from "../../messages/de.json";

const messagesMap = { fr, en, de };

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  const messages = messagesMap[locale];

  if (!messages) notFound();

  return <Providers messages={messages}>{children}</Providers>;
}
