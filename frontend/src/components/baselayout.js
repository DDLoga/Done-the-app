import React, { useEffect } from 'react';

function BaseLayout({ children, headerContent }) {
    useEffect(() => {
        if (window.matchMedia('(max-width: 600px)').matches) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen w-screen bg-gray-900 text-white">
            <header className="p-6 bg-gray-800 border-b border-gray-700 pl-24">
                {headerContent}
            </header>
            <main className="flex-grow p-6"> 
                {children}
            </main>
            <footer className="pl-24 p-6 bg-gray-800 border-t border-gray-700">
                {/* Footer content goes here */}
                {/* The footer as defined on baseLayout.js */}
            </footer>
        </div>
    );
}

export default BaseLayout;