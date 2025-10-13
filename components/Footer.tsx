
import React from 'react';
import { APP_NAME } from '../constants';

const SocialIcon = ({ d }: { d: string }) => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d={d} clipRule="evenodd" />
    </svg>
);

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 dark:bg-black text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1: About */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">About {APP_NAME}</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Our Team</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Press Releases</a></li>
                        </ul>
                    </div>

                    {/* Column 2: Community */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Community</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Submit News</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Event Calendar</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Advertise</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Partnerships</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">FAQ</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Newsletter</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">RSS Feeds</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Use</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Accessibility</a></li>
                            <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-base text-gray-400 md:order-1">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0 md:order-2">
                         <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Facebook</span><SocialIcon d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></a>
                         <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Twitter</span><SocialIcon d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.54-.18-6.69-1.86-8.79-4.46-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.55v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06 1.83 1.16 4 1.84 6.33 1.84 7.6 0 11.76-6.3 11.76-11.76l-.01-1.05c.8-.58 1.48-1.3 2.02-2.13z" /></a>
                         <a href="#" className="text-gray-400 hover:text-white"><span className="sr-only">Instagram</span><SocialIcon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.92 7.82c-.04.14-.1.28-.17.41-.35.68-.88 1.2-1.57 1.57-.13.07-.27.13-.41.17-.42.14-1.04.22-1.77.22s-1.35-.08-1.77-.22c-.14-.04-.28-.1-.41-.17-.68-.35-1.2-.88-1.57-1.57-.07-.13-.13-.27-.17-.41-.14-.42-.22-1.04-.22-1.77s.08-1.35.22-1.77c.04-.14.1-.28.17-.41.35-.68.88-1.2 1.57-1.57.13-.07.27-.13.41-.17.42-.14 1.04-.22 1.77-.22s1.35.08 1.77.22c.14.04.28.1.41.17.68.35 1.2.88 1.57 1.57.07.13.13.27.17.41.14.42.22 1.04.22 1.77s-.08 1.35-.22 1.77zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
