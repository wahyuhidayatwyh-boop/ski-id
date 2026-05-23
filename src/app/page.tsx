import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import AcaraSection from "@/components/home/AcaraSection";
import AboutSection from "@/components/home/AboutSection";
import VisionSection from "@/components/home/VisionSection";
import GeoPortalSection from "@/components/home/GeoPortalSection";
import TeamSection from "@/components/home/TeamSection";
import DokumentasiSection from "@/components/home/DokumentasiSection";
import CatalogSection from "@/components/home/CatalogSection";
import FaqSection from "@/components/home/FaqSection";
import LaporSection from "@/components/home/LaporSection";

export default function Home() {
    return (
        <>
            <Navbar />
            <HeroSection />
            <AcaraSection />
            <AboutSection />
            <VisionSection />
            <GeoPortalSection />
            <TeamSection />
            <DokumentasiSection />
            <CatalogSection />
            <FaqSection />
            <LaporSection />
            <Footer />
        </>
    );
}