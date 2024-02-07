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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <h1 className="text-5xl font-bold mb-8">
                <span className="text-white">Welcome,</span> 
                <span className="text-yellow-300">{user}</span>
            </h1>
            <h2 className="text-3xl mb-8">Start to organize your mind and your day from the side menu</h2>
        </div>
        </BaseLayout>
    );
};

export default WelcomeMessage;