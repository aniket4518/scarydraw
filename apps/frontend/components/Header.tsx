import { Skull } from "lucide-react";
import Link from "next/link";

export default function Header() {
return(
    <> 
<header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
              <Skull className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Scary Draw</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-red-600 transition-colors">Features</a>
            <a href="#showcase" className="text-gray-600 hover:text-red-600 transition-colors">Gallery</a>
            <a href="#pricing" className="text-gray-600 hover:text-red-600 transition-colors">Pricing</a>
            <Link href="/room">
            <button className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105">
              Start Drawing
            </button>
            </Link>
          </div>
        </nav>
      </header>
      </>
)
}