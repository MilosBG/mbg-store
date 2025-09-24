"use client";
import Link from "next/link";
import React from "react";
import SocialMedia from "./SocialMedia";
import FooterTop from "./FooterTop";
import Container from "@/components/mbg-components/Container";

const Footer = () => {
  return (
    <>
      <footer className="bg-mbg-black pb-2 mt-7">
        <div className="py-3" >
          <Container><FooterTop /></Container>
        </div>
        <Container className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Website links */}
          <div>
            <h3 className="text-mbg-lightgrey text-sm uppercase font-semibold mb-4">
              Information
            </h3>
            <ul className="space-y-2">
              <li className="mbg-hover hoverEffect">
                <Link href={"/terms-conditions"}>Terms and Conditions</Link>
              </li>
              <li className="mbg-hover hoverEffect">
                <Link href={"/privacy-policy"}>Privacy Policy</Link>
              </li>
              <li className="mbg-hover hoverEffect">
                <Link href={"/legal-notice"}>Legal Notice</Link>
              </li>
              <li className="mbg-hover hoverEffect">
                <Link href={"/contact"}>Contact</Link>
              </li>
            </ul>
          </div>
  
          {/* Website links */}
          <div>
            <h3 className="text-mbg-lightgrey text-sm uppercase font-semibold mb-4">
              Milos BG
            </h3>
            <ul className="space-y-2">
              <li className="mbg-hover hoverEffect">
                <Link href={"/the-background"}>The Background</Link>
              </li>
            </ul>
          </div>
  
          {/* Website links */}
          <div>
            <h3 className="text-mbg-lightgrey text-sm uppercase font-semibold mb-4">
              Grind News
            </h3>
            <div className="flex items-center justify-start gap-3.5">
              <SocialMedia />
            </div>
          </div>
        </Container>
        {/* Footer Bottom Copyright */}
        <Container>
          <div className="text-mbg-white/95 font-light text-[10px] tracking-tighter text-center border-t border-mbg-darkgrey pt-3 pb-1 mt-4 px-0">
            &copy; {new Date().getFullYear()} Milos BG - All rights reserved
            
          </div>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
