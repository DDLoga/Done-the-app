import React from 'react';
import BaseLayout from './baselayout';
import { Link } from 'react-router-dom';

const login = () => {
    return (
        <BaseLayout>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
                <h1 className="text-5xl font-bold mb-4 text-yellow-300">DONE, the App</h1>
                <h2 className="text-3xl mb-2">This is the React version of DONE, the App!</h2>
                <h2 className="text-3xl mb-8">Click on the Login link in the side bar to login</h2>
                <p className="text-xl mb-8">
                    Another front end version is available 
                    <a 
                        href="https://flavourdev.pythonanywhere.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 underline mx-2"
                    >
                        here
                    </a> 
                    if you prefer Django & vanilla JS
                </p>
                <div className="flex space-x-4">

                    <Link 
                        to="/login" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                        Login
                    </Link>
                    <a 
                        href="https://flavourdev.pythonanywhere.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400 transition-colors"
                    >
                        Try Django Version
                    </a>

                </div>
            </div>
        </BaseLayout>
    );
};

export default login;