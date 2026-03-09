import { Link } from "react-router-dom";
import {
  Gem,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-sapphire-800 dark:text-gold-500 mb-4"
            >
              <Gem className="h-8 w-8" />
              <span className="font-serif text-2xl font-bold tracking-tight">
                VETRO VIVO
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
              Discover the natural brilliance of Ceylon gemstones. Ethically
              sourced, carefully authenticated, and beautifully presented for
              collectors and connoisseurs worldwide.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-500 shadow-sm transition-all hover:-translate-y-1"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-500 shadow-sm transition-all hover:-translate-y-1"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-500 shadow-sm transition-all hover:-translate-y-1"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 hover:text-sapphire-600 dark:hover:text-gold-500 shadow-sm transition-all hover:-translate-y-1"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/catalog"
                  className="text-slate-600 hover:text-sapphire-600 dark:text-slate-400 dark:hover:text-gold-500 transition-colors"
                >
                  Shop Gems
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-slate-600 hover:text-sapphire-600 dark:text-slate-400 dark:hover:text-gold-500 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-600 hover:text-sapphire-600 dark:text-slate-400 dark:hover:text-gold-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-600 hover:text-sapphire-600 dark:text-slate-400 dark:hover:text-gold-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Mail className="h-5 w-5 text-sapphire-600 dark:text-gold-500" />
                <span>vetrovivo.lk@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Phone className="h-5 w-5 text-sapphire-600 dark:text-gold-500" />
                <span>+94 77 XXXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <MapPin className="h-5 w-5 text-sapphire-600 dark:text-gold-500" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-sm flex items-center gap-1">
            &copy; {new Date().getFullYear()} VETRO VIVO. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
