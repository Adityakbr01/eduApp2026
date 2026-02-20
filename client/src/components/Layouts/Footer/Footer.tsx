"use client";

import { motion } from "motion/react";
import FooterLogoGlow from "./FooterLogoGlow";
import FooterSocials from "./FooterSocials";
import FooterLinks from "./FooterLinks";

export default function Footer() {
  return (
    <motion.footer
      className="bg-black text-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Large Logo Section - Desktop Only */}
      <FooterLogoGlow />

      {/* Footer Content */}
      <section className="px-4 sm:px-8 md:px-18 flex flex-col lg:flex-row lg:justify-between gap-10 md:gap-16 lg:gap-24 pb-10">
        {/* Left: Logo + Socials */}
        <motion.div
          className="w-full lg:w-auto shrink-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FooterSocials />
        </motion.div>

        {/* Right: Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FooterLinks />
        </motion.div>
      </section>

      <div className="mt-24" />
    </motion.footer>
  );
}
