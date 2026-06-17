import { redirect } from 'next/navigation';

import { Footer, Header } from '@/components/organisms';
import { TalkJsProvider } from '@/components/providers';
import { retrieveCustomer } from '@/lib/data/customer';
import { checkRegion } from '@/lib/helpers/check-region';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const user = await retrieveCustomer();
  const regionCheck = await checkRegion(locale);

  if (!regionCheck) {
    return redirect('/');
  }

  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User';

  // The WRDO spine provider always wraps the app: the conversation is keyed by
  // the wrdo_spine httpOnly cookie (set via /spine/session/exchange), not by
  // Medusa auth — so the chat surface works even for handoff visitors who
  // arrive via shop.wrdo.co.za/c?t=<token> without a logged-in customer.
  return (
    <TalkJsProvider
      userId={user?.id}
      userName={userName}
      userEmail={user?.email ?? undefined}
    >
      <Header locale={locale} />
      {children}
      <Footer />
    </TalkJsProvider>
  );
}
