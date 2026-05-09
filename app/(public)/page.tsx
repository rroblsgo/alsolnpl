import Hero from '@/components/ui/Hero';
import FeaturedCommunities from '@/src/fetatures/communities/components/FeaturedCommunities';
import CategoryList from '@/src/fetatures/meetis/components/CategoryList';
import UpcomingMeetis from '@/src/fetatures/meetis/components/UpcomingMeetis';
// import { meetiService } from '@/src/fetatures/meetis/services/MeetiService';
// import { auth } from '@/src/lib/auth';
import { generatePageTitle } from '@/utils/metadata';
import { Metadata } from 'next';
// import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: generatePageTitle('Inicio'),
  description: 'Home Page nuestra aplicación Meeti-next16',
};

export default async function Home() {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  // const meetis = await meetiService.getUpcoming();
  // console.log('Session en Home:', session);
  return (
    <>
      <Hero />
      <UpcomingMeetis />
      <FeaturedCommunities />
      <CategoryList />
    </>
  );
}
