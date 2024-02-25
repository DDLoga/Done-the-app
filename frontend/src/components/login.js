import React from 'react';
import BaseLayout from './baselayout';
import { Link } from 'react-router-dom';

const login = () => {
    return (
        <BaseLayout>
            <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
                <h1 className="text-5xl font-bold mb-4 text-yellow-300">DONE, the App</h1>
                <h2 className="text-3xl mb-2">Capture your ideas, prioritize, schedule and execute</h2>
                <h2 className="text-3xl mb-8">Be always on the right task at the right moment</h2>
                <div className="flex space-x-4">

                    <Link 
                        to="/login" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                        Login
                    </Link>

                    <Link 
                        to="/register" 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                        Register
                    </Link>

                </div>
            </div>
        </BaseLayout>
    );
};

export default login;