import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Zap, ShieldCheck, Globe, Star, ChevronRight, Package } from 'lucide-react';
import FlashSales from '../components/home/FlashSales';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import MagneticButton from '../components/common/MagneticButton';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};


const sentence = "Essentials.";
const letterVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};


export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }


  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeatured(res.data?.data || null);
      } catch (err) {
        console.error('Featured sync failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    { icon: Zap, title: 'Rapid Delivery', desc: 'Global logistics network for lightning fast acquisition.' },
    { icon: ShieldCheck, title: 'Secure Vault', desc: 'Cipher-grade encryption for every transaction.' },
    { icon: Globe, title: 'Global Access', desc: 'Sourcing the finest artifacts from across the digital realm.' },
  ];

  return (
    <motion.div 
      initial={{ filter: "blur(10px)", opacity: 0 }}
      animate={{ filter: "blur(0px)", opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="overflow-x-hidden relative"
    >
      
      {/* Hero Section */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden group/hero"
      >
        {/* Interactive Glow */}
        <motion.div 
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(99, 102, 241, 0.08), transparent 40%)`
          }}
        />
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-10 relative z-10"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
            >
               <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Registry v4.2.0</span>
            </motion.div>
            
            <motion.h1 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="text-7xl md:text-8xl font-bold tracking-tight leading-[0.9]"
            >
              Signature <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light inline-block whitespace-nowrap">
                {sentence.split("").map((char, index) => (
                  <motion.span 
                    key={index} 
                    variants={letterVariants} 
                    transition={{ duration: 0.1 }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl font-light max-w-lg leading-relaxed opacity-80"
            >
              Acquire elite-tier digital artifacts and premium lifestyle essentials designed for the modern visionary.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-5"
            >
              <MagneticButton strength={30}>
                <Link to="/products" className="btn-primary py-5 px-10 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 group h-full">
                  Enter Catalog <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </MagneticButton>
              <Link to="/collections" className="py-5 px-10 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">
                Collections
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-8 pt-8 border-t border-white/5"
            >
               <div>
                  <p className="text-2xl font-bold text-white">48k+</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Members</p>
               </div>
               <div className="w-px h-10 bg-white/5" />
               <div>
                  <p className="text-2xl font-bold text-white">1.2m</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Assets</p>
               </div>
            </motion.div>
          </motion.div>

          {/* Visual Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative group hidden lg:block"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="relative aspect-[4/5] bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 overflow-hidden shadow-2xl flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-full bg-white/5 rounded-[2rem] animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Loading Telemetry...</span>
                  </div>
                ) : featured ? (
                    <Link to={`/products/${featured._id}`} className="block w-full h-full relative z-10 cursor-pointer">
                      <img 
                        src={featured.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"} 
                        className="w-full h-full object-cover rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform duration-1000" 
                        alt={featured.name} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute inset-x-8 bottom-8 p-8 glass-card space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform"
                      >
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest">Featured Node</span>
                            <div className="flex gap-1 text-amber-400">
                               {Array.from({ length: Math.round(featured.avgRating || 5) }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                         </div>
                         <h4 className="text-xl font-bold">{featured.name}</h4>
                         <p className="text-xs font-light line-clamp-1 opacity-70">{featured.description}</p>
                         <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold text-[var(--text-heading)]">₹{featured.price.toLocaleString('en-IN')}</span>
                            <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                               <ChevronRight size={16} />
                            </div>
                         </div>
                      </motion.div>
                    </Link>
                ) : (
                  <div className="w-full h-full bg-white/5 rounded-[2rem] flex flex-col items-center justify-center space-y-4">
                    <Package size={48} className="text-slate-700" />
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No Node Selected</p>
                  </div>
                )}
             </div>
          </motion.div>
        </div>
      </section>

      {/* Flash Sales Section */}
      <FlashSales />

      {/* Feature Grid */}
      <section className="py-32 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-10 space-y-6 hover:border-primary/30 hover:-translate-y-2 transition-all"
            >
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <f.icon size={28} />
               </div>
               <div className="space-y-3">
                  <h3 className="text-2xl font-bold">{f.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed">{f.desc}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="py-32 px-6"
      >
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] p-16 md:p-24 text-center space-y-10 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Ready to elevate your <br /> digital sanctum?
            </h2>
            <p className="text-xl text-indigo-100/70 font-light max-w-2xl mx-auto leading-relaxed">
               Join 48,000+ visionaries who have already synchronized their workspace with NexusGood artifacts.
            </p>
             <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
               {isAuthenticated ? (
                 <Link to="/profile" className="bg-white text-indigo-900 py-5 px-12 rounded-2xl font-bold uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all">
                    View Profile
                 </Link>
               ) : (
                 <Link to="/register" className="bg-white text-indigo-900 py-5 px-12 rounded-2xl font-bold uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all">
                    Join the Circle
                 </Link>
               )}
               <Link to="/products" className="py-5 px-12 border border-white/20 rounded-2xl font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md">

                  Browse Registry
               </Link>
            </div>
         </div>
      </motion.section>
    </motion.div>
  );
}
