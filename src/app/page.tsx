'use client';

import Image from "next/image";
import Link from "next/link";
import { FileText, MessageCircle, PhoneCall, MapPin, Package, Zap, Clock, ShieldCheck, Headset, Smile, ArrowRight, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const phoneNumber = "+224624816383";
  const [isLocating, setIsLocating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWhatsAppOrder = () => {
    setIsLocating(true);
    
    const openWhatsApp = (lat?: number, lng?: number) => {
      setIsLocating(false);
      let message = `Bonjour Sewa Delivery ! 👋\nJe souhaite commander un coursier.`;
      if (lat && lng) {
        message += `\n\n📍 Voici ma position exacte :\nhttps://www.google.com/maps?q=${lat},${lng}`;
      }
      window.open(`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          openWhatsApp(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Erreur de géolocalisation:", error);
          // Fallback direct sans alert pour une expérience fluide
          openWhatsApp();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      openWhatsApp();
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_delivery_rider.png"
            alt="Sewa Delivery Rider in Conakry"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 md:mb-6 tracking-tight">
              Sewa Delivery : <span className="text-sewa-yellow">Votre bonheur</span> livré avec le sourire
            </h1>
            <p className="text-base md:text-xl text-gray-200 mb-8 md:mb-10 max-w-xl font-medium">
              La solution logistique instantanée, joyeuse et impeccablement organisée pour tous vos envois.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="bg-sewa-red text-white px-6 py-4 md:px-8 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-transform active:scale-95 shadow-xl shadow-red-500/20 w-full sm:w-auto text-sm md:text-base">
                <Package className="w-5 h-5" />
                Commander maintenant
              </button>
              <button onClick={() => document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' })} className="bg-transparent border-2 border-white text-white px-6 py-4 md:px-8 md:py-4 rounded-xl font-bold hover:bg-white/10 transition-colors active:scale-95 w-full sm:w-auto text-sm md:text-base">
                Estimer le tarif
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Comment pouvons-nous vous aider ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base font-medium">Choisissez le mode de commande qui vous convient le mieux. Rapide, simple et sécurisé.</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Card 1 */}
            <Link href="/commander" className="block h-full group">
              <motion.div variants={fadeInUp} className="bg-sewa-red text-white rounded-3xl p-5 md:p-6 shadow-xl shadow-red-500/20 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 md:mb-5 transform group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Envoyer un Colis</h3>
                <p className="text-red-100 mb-6 md:mb-8 text-xs md:text-sm flex-grow font-medium leading-relaxed">Formulaire détaillé pour vos envois importants. Suivi complet garanti.</p>
                <div className="flex items-center justify-between font-bold text-xs md:text-sm tracking-wider uppercase group-hover:underline">
                  <span>Remplir le formulaire</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            </Link>

            {/* Card 2 - WhatsApp (Functional) */}
            <motion.div variants={fadeInUp} onClick={handleWhatsAppOrder} className="bg-sewa-yellow text-gray-900 rounded-3xl p-5 md:p-6 shadow-xl shadow-yellow-500/20 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-4 md:mb-5 relative z-10 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 relative z-10">Commander via WhatsApp</h3>
              <p className="text-gray-800 mb-6 md:mb-8 text-xs md:text-sm flex-grow relative z-10 font-medium leading-relaxed">Rapide & Position GPS en un clic. La solution la plus populaire.</p>
              <div className="flex items-center justify-between font-bold text-xs md:text-sm tracking-wider uppercase relative z-10 text-gray-900">
                <span>{isLocating ? "Géolocalisation..." : "Ouvrir WhatsApp"}</span> 
                {isLocating ? (
                  <span className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full"></span>
                ) : (
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-2 transition-transform" />
                )}
              </div>
            </motion.div>

            {/* Card 3 - Call (Functional) */}
            <motion.div variants={fadeInUp} className="bg-white border border-gray-100 text-gray-900 rounded-3xl p-5 md:p-6 shadow-xl shadow-gray-200/50 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 md:mb-5 transform group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5 md:w-6 md:h-6 text-sewa-red" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Appeler un agent</h3>
              <p className="text-gray-500 mb-6 md:mb-8 text-xs md:text-sm flex-grow font-medium leading-relaxed">Assistance directe et humaine pour vos besoins spécifiques.</p>
              <a href={`tel:${phoneNumber}`} className="flex items-center justify-between font-bold text-sewa-red text-xs md:text-sm tracking-wider uppercase group-hover:underline">
                <span>Nous contacter</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-2 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-3" {...fadeInUp}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
              <span className="text-sewa-red bg-red-50 p-2 rounded-xl"><MapPin className="w-6 h-6" /></span> 
              Nos zones de bonheur
            </h2>
            <button className="text-sewa-red font-bold text-sm hover:underline bg-red-50 px-4 py-2 rounded-full hidden sm:block">Voir la carte</button>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { title: "Zone proche", desc: "< 5 KM", price: "10 000 GNF" },
              { title: "Zone moyenne", desc: "5-15 KM", price: "25 000 GNF" },
              { title: "Zone éloignée", desc: "15+ KM", price: "45 000 GNF" },
            ].map((zone, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-gray-50 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors border border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 shrink-0">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">{zone.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{zone.desc}</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg md:text-xl font-black text-sewa-red shrink-0">{zone.price}</span>
              </motion.div>
            ))}

            <motion.div variants={fadeInUp} className="bg-red-50 border border-red-100 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-2 hover:bg-red-100 transition-colors shadow-sm shadow-red-100/50 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-sewa-red/10 w-24 h-24">
                <Zap className="w-full h-full" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-sewa-red shrink-0">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sewa-red text-sm md:text-base">Express prioritaire</h4>
                  <p className="text-[10px] md:text-xs text-sewa-red/80 uppercase font-bold tracking-wider">Livraison immédiate</p>
                </div>
              </div>
              <span className="text-base sm:text-lg md:text-xl font-black text-sewa-red relative z-10">60 000 GNF</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              { icon: Clock, title: "Rapide", desc: "Moins de 30 min", color: "text-sewa-yellow", bg: "bg-yellow-50" },
              { icon: ShieldCheck, title: "Sécurisé", desc: "Vérifié & tracé", color: "text-sewa-red", bg: "bg-red-50" },
              { icon: Headset, title: "Support 24/7", desc: "Toujours à l'écoute", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Smile, title: "Satisfaction", desc: "Garanti à 100%", color: "text-green-500", bg: "bg-green-50" },
            ].map((Feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center p-3 md:p-4 bg-white rounded-3xl shadow-sm border border-gray-50">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${Feature.bg} flex items-center justify-center mb-3 md:mb-4`}>
                  <Feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${Feature.color}`} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{Feature.title}</h4>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold">{Feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 md:mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Sewa Delivery Logo" width={48} height={48} className="object-contain drop-shadow-sm" />
                <span className="text-xl font-black text-gray-900 tracking-tight">Sewa Delivery</span>
              </div>
              <p className="text-sm text-gray-500 pr-4 font-medium leading-relaxed">Fast. Reliable. Joyful. L&apos;excellence de la logistique à portée de main.</p>
            </div>
            
            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Liens utiles</h5>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-sewa-red transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-sewa-red transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-sewa-red transition-colors">Support</Link></li>
                <li><Link href="#" className="hover:text-sewa-red transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Contact</h5>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> Conakry, Guinée</li>
                <li><a href={`tel:${phoneNumber}`} className="flex items-center gap-2 hover:text-sewa-red transition-colors"><PhoneCall className="w-4 h-4 text-gray-400 hover:text-sewa-red" /> +224 624 81 63 83</a></li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-gray-400" /> hello@sewadelivery.com</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Réseaux</h5>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-sewa-red hover:text-white transition-all shadow-sm">
                  <span className="font-serif italic font-bold">in</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-sewa-red hover:text-white transition-all shadow-sm">
                  <span className="font-bold text-lg">f</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 text-center text-xs md:text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} Sewa Delivery. Fast. Reliable. Joyful.
          </div>
        </div>
      </footer>
    </div>
  );
}
