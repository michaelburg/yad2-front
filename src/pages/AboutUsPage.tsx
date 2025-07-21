import React from 'react';
import { Building, Users, Target, Heart } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-[#121212] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
          <p className="text-xl text-[#AAAAAA]">
            Making real estate management simple and intuitive
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-blue-500" size={24} />
              <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
            </div>
            <p className="text-[#AAAAAA] leading-relaxed">
              We aim to revolutionize how people manage their real estate
              searches by providing intuitive tools to organize, track, and make
              informed decisions about properties.
            </p>
          </div>

          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-500" size={24} />
              <h2 className="text-2xl font-semibold text-white">What We Do</h2>
            </div>
            <p className="text-[#AAAAAA] leading-relaxed">
              Our platform helps you organize properties into categories like
              liked, disliked, and provides a Tinder-style interface for quick
              property browsing and decision making.
            </p>
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-green-500" size={24} />
            <h2 className="text-2xl font-semibold text-white">Our Team</h2>
          </div>
          <p className="text-[#AAAAAA] leading-relaxed mb-6">
            We're a passionate team of developers and real estate enthusiasts
            dedicated to making property management more efficient and
            enjoyable.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Building className="text-white" size={24} />
              </div>
              <h3 className="text-white font-medium">Product Team</h3>
              <p className="text-[#AAAAAA] text-sm">User Experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-white font-medium">Development</h3>
              <p className="text-[#AAAAAA] text-sm">Technical Innovation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-white font-medium">Support</h3>
              <p className="text-[#AAAAAA] text-sm">Customer Success</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
