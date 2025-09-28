 import React from 'react';
import { Skull, Ghost, Zap, Users, ArrowRight, Play, Star, Github, Twitter, PenTool, Share2, Eye, Moon, Flame } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
         
        {/* Floating Spooky Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg rotate-45 animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-600 to-red-600 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rotate-45 animate-spin opacity-40" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-20 h-20 border-2 border-red-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-14 h-14 bg-gradient-to-r from-purple-600 to-red-600 clip-triangle animate-pulse opacity-50"></div>
        <div className="absolute top-80 right-10 w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg animate-bounce opacity-60" style={{animationDelay: '2s'}}></div>
      </div>

     <Header/>
      

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 border border-red-200 rounded-full px-4 py-2 mb-8">
            <Ghost className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-700">Spooky Collaborative Drawing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent">
            Draw Your
            <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Nightmares</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The spookiest collaborative whiteboard inspired by Excalidraw. 
            Create haunting sketches, eerie diagrams, and terrifying doodles with your team.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
             <Link href="/room">
            <button className="group bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2">
              <span> Room</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>

             <Link href="/signin">
            <button className="group bg-gradient-to-r from-purple-600 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2">
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>

            <Link href='/signup'>
            <button className="group flex items-center space-x-2 px-8 py-4 rounded-lg border border-gray-300 hover:border-red-500 bg-white hover:bg-red-50 transition-all duration-300">
              <Play className="w-5 h-5 text-red-600" />
              <span className="text-gray-700">Sign Up</span>
            </button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mt-16 text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-orange-500 fill-current" />
              <span>4.8/5 rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-500" />
              <span>100K+ spooky artists</span>
            </div>
            <div>
              <span>Free to haunt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Why Choose <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Scary Draw</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All the collaborative power of Excalidraw, with a spine-chilling twist that makes drawing together hauntingly fun.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Haunted Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together in real-time like Excalidraw. Multiple cursors, instant sync, and seamless spooky collaboration.
              </p>
            </div>
            
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Spooky Drawing Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                All your favorite Excalidraw tools with a dark twist. Sketch ghosts, draw monsters, and create eerie diagrams.
              </p>
            </div>
            
            <div className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Zero-lag performance with instant loading. Smooth drawing experience that's faster than a ghost's whisper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="relative z-10 px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              From <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Sketches</span> to <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent">Nightmares</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create everything from simple wireframes to complex horror illustrations. Perfect for Halloween projects, spooky presentations, and creative brainstorming.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Drawing Preview Cards */}
            <div className="group relative bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-full h-48 bg-white rounded-lg mb-4 flex items-center justify-center border border-red-200 shadow-sm">
                  <div className="text-center">
                    <div className="flex space-x-2 mb-4 justify-center">
                      <Skull className="w-8 h-8 text-red-500" />
                      <Ghost className="w-8 h-8 text-purple-500" />
                      <Eye className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-red-600 text-sm font-medium">Spooky Icons</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Horror Sketching</h3>
                <p className="text-gray-600 text-sm">Create spine-chilling sketches and eerie doodles with familiar drawing tools</p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-50 to-red-50 border border-purple-200 rounded-2xl p-6 hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-full h-48 bg-white rounded-lg mb-4 flex items-center justify-center border border-purple-200 shadow-sm">
                  <div className="text-center">
                    <div className="relative mx-auto mb-4">
                      <div className="w-12 h-16 bg-gradient-to-r from-purple-500 to-red-500 rounded-lg transform -rotate-12 shadow-lg"></div>
                      <div className="absolute -top-2 -right-2 w-8 h-12 bg-gradient-to-r from-purple-400 to-red-400 rounded-lg transform rotate-12 opacity-70"></div>
                    </div>
                    <p className="text-purple-600 text-sm font-medium">Dark Diagrams</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Eerie Flowcharts</h3>
                <p className="text-gray-600 text-sm">Design haunting flowcharts and spooky system diagrams for your projects</p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-full h-48 bg-white rounded-lg mb-4 flex items-center justify-center border border-orange-200 shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    </div>
                    <p className="text-orange-600 text-sm font-medium">Team Haunting</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Collaborative Scares</h3>
                <p className="text-gray-600 text-sm">Work together in real-time to create the most frightening designs</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/room">
            <button className="group bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto">
              <span>Start Your Nightmare</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Skull className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Scary Draw</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <span className="text-gray-400">© 2025 Scary Draw. All frights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;