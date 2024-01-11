import React, { useContext } from "react";
import UserContext from './UserContext';
import styles from "./sidemenu.module.css";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTasks,
    faClipboard,
    faCalendar,
    faList,
    faBook,
    faDatabase,
    faBars,
} from "@fortawesome/free-solid-svg-icons";


function SideMenu() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles["side-menu"]}>
            <div>
                <h3 className={styles["menu-header"]}>
                    <div className={styles["menu-icon"]}>
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <div className={styles["menu-text"]}>
                        <span>Menu</span>
                    </div>
                </h3>
                <ul>
                    <li>
                        <FontAwesomeIcon icon={faTasks} onClick={() => navigate('/quicktask')} />
                        <span onClick={() => navigate('/quicktask')}> Quick Task Entry</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faClipboard} />
                        <span> New Task capture</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faCalendar} onClick={() => navigate('/newtaskorganizer')}/>
                        <span onClick={() => navigate('/newtaskorganizer')}> New Task Organizer</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faList} />
                        <span> Prioritizer</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faBook} />
                        <span> Contexts</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faDatabase} />
                        <span> Resources</span>
                    </li>
                </ul>
            </div>  
                {user && 
                <ul>
                    <li>
                        <span className={styles.logged}>Logged in as {user}</span>   
                    </li>
                </ul>}
                <button 
                        className={styles["login-button"]} 
                        onClick={handleLogout}
                    >
                        {user ? 'Log Out' : 'Log In'}
                </button>
        </div>
    );
};

export default SideMenu;
