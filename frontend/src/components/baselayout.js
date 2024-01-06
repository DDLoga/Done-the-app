import React from 'react';

const BaseLayout = ({ children }) => {
    return (
        <div>
            <header>
                {/* Header content goes here */}
                the header
            </header>

            <main>
                {children}
                the main
            </main>

            <footer>
                {/* Footer content goes here */}
                the footer
            </footer>

            {/* jQuery script from base.html */}
            <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=652482ea837db348b1939c93" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossOrigin="anonymous"></script>
        </div>
    );
};

export default BaseLayout;