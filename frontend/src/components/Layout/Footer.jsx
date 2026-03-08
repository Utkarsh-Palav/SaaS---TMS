import React from "react";
import { Link } from "react-router-dom";
import { Layers, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0e100f] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
             <Link to="/" className="flex items-center gap-2 mb-6 group">
                <div className="h-8 w-8 bg-[#3B82F6] rounded flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Layers className="text-black w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter">
                  Task<span className="text-[#3B82F6]">ify</span>
                </span>
              </Link>
            <p className="text-slate-400 text-base font-medium leading-relaxed">
              The operating system for modern organizations. Build, track, and execute effortlessly.
            </p>
            <div className="mt-8 flex space-x-5">
              <SocialIcon icon={<Twitter size={22} />} href="https://twitter.com" />
              <SocialIcon icon={<Github size={22} />} href="https://github.com" />
              <SocialIcon icon={<Linkedin size={22} />} href="https://linkedin.com" />
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn 
            title="Product" 
            items={[
              { name: "Features", to: "/integrations" },
              { name: "Integrations", to: "/integrations" },
              { name: "Pricing", to: "/plans" },
              { name: "Changelog", to: "/changelog" }
            ]} 
          />
          <FooterColumn 
            title="Company" 
            items={[
              { name: "About Us", to: "/about" },
              { name: "Careers", to: "/careers" },
              { name: "Blog", to: "/integrations" },
              { name: "Contact", to: "/contact" }
            ]}
          />
          <FooterColumn 
            title="Legal" 
            items={[
              { name: "Privacy Policy", to: "/privacy" },
              { name: "Terms of Service", to: "/terms" },
              { name: "Cancellation & Refund", to: "/cancellation-refund" },
              { name: "Shipping Policy", to: "/shipping-policy" }
            ]}
          />
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-slate-500">
            &copy; {new Date().getFullYear()} Taskify Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-wider">
            <Link to="/privacy" className="hover:text-[#0ae448] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#0ae448] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, items }) => (
  <div>
    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">
      {title}
    </h3>
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.name}>
          <Link 
            to={item.to} 
            className="text-base font-medium text-slate-400 hover:text-[#0ae448] transition-colors"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-slate-400 hover:text-[#0ae448] hover:scale-110 transition-all"
  >
    {icon}
  </a>
);

export default Footer;