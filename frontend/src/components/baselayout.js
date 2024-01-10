import React from 'react';
import baseLayoutStyle from './baseLayout.module.css';

const BaseLayout = ({ children }) => {
    return (
        <div className={baseLayoutStyle.body}>
            <header className={baseLayoutStyle.header}>
                {/* Header content goes here */}
                the header as defined on baseLayout.js
            </header>

            <main className={baseLayoutStyle.main}>
                {children}
            </main>

            <footer className={baseLayoutStyle.footer}>
                {/* Footer content goes here */}
                the footer as defined on baseLayout.js
            </footer>
        </div>
    );
};

export default BaseLayout;