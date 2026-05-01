import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import SocialProof from '../common/SocialProof';
import AIStylist from '../common/AIStylist';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SocialProof />
      <AIStylist />
    </div>
  );
}
