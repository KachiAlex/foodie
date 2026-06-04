import { ChefHat, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const routeMap: Record<string, string> = {
  "About Us": "/",
  "How It Works": "/",
  "Become a Chef": "/auth/sign-up?role=vendor",
  "Chef Dashboard": "/dashboard/vendor",
  "Browse Chefs": "/dashboard/buyer",
  "Popular Dishes": "/dashboard/buyer",
  "Cuisines": "/dashboard/buyer",
};

function FooterLink({ label }: { label: string }) {
  const to = routeMap[label];
  if (to) {
    return (
      <li>
        <Link to={to} className="hover:text-orange-500 transition-colors">
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <span className="cursor-not-allowed opacity-50" title="Coming soon">
        {label}
      </span>
    </li>
  );
}

export function Footer() {
  const footerLinks = {
    company: {
      title: "Company",
      links: ["About Us", "How It Works", "Careers", "Press Kit", "Contact"]
    },
    forChefs: {
      title: "For Chefs",
      links: ["Become a Chef", "Chef Dashboard", "Resources", "Success Stories", "FAQs"]
    },
    support: {
      title: "Support",
      links: ["Help Center", "Safety", "Terms of Service", "Privacy Policy", "Community Guidelines"]
    },
    discover: {
      title: "Discover",
      links: ["Browse Chefs", "Popular Dishes", "Cuisines", "Delivery Locations", "Blog"]
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">Foodie Market</span>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting home chefs with hungry customers. Fresh, local, and delicious.
            </p>
            <div className="flex gap-4">
              <span className="bg-gray-800 p-2 rounded-lg cursor-not-allowed opacity-50" title="Coming soon">
                <Facebook className="w-5 h-5" />
              </span>
              <span className="bg-gray-800 p-2 rounded-lg cursor-not-allowed opacity-50" title="Coming soon">
                <Twitter className="w-5 h-5" />
              </span>
              <span className="bg-gray-800 p-2 rounded-lg cursor-not-allowed opacity-50" title="Coming soon">
                <Instagram className="w-5 h-5" />
              </span>
              <span className="bg-gray-800 p-2 rounded-lg cursor-not-allowed opacity-50" title="Coming soon">
                <Youtube className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <FooterLink key={link} label={link} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Foodie Market. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <span className="cursor-not-allowed opacity-50" title="Coming soon">Privacy Policy</span>
              <span className="cursor-not-allowed opacity-50" title="Coming soon">Terms of Service</span>
              <span className="cursor-not-allowed opacity-50" title="Coming soon">Cookie Settings</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
