import React from 'react';

function BaseLayout({ children, headerContent }) {
    return (
        <div className="flex flex-col min-h-screen w-screen bg-gray-900 text-white">
            <header className="p-6 bg-gray-800 border-b border-gray-700 pl-24">
                {headerContent}
            </header>
            <main className="flex-grow pl-24 p-6">
                {children}
            </main>
            <footer className="pl-24 p-6 bg-gray-800 border-t border-gray-700">
                {/* Footer content goes here */}
                The footer as defined on baseLayout.js
            </footer>
        </div>
    );
}

export default BaseLayout;