import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meeti - About',
  description: 'About Page of our Meeti-next16 aplicación de Next.js',
};
export default function AboutPage() {
  return (
    <>
      <h1>About Page</h1>
      <Link href="/">Home Page</Link>
    </>
  );
}
