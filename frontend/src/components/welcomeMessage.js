import React, { useContext } from "react";
import UserContext from './UserContext';
import BaseLayout from './baselayout';

function WelcomeMessage() {
    const { user } = useContext(UserContext);

    if (!user) {
        return null;
    }

    return (
        <BaseLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white px-4 sm:px-0">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-8">
                <span className="text-white">Welcome,</span> 
                <span className="text-yellow-300">{user}</span>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-8 text-center">Start to organize your mind and your day from the side menu</h2>
        </div>
        </BaseLayout>
    );
};

export default WelcomeMessage;