import React, { useContext } from "react";
// import { UserContext } from './components/UserContext'; // replace with the actual path to your UserContext
import UserContext from './UserContext';
import styles from "./sidemenu.module.css";
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
                        <FontAwesomeIcon icon={faTasks} />
                        <span> Quick Task Entry</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faClipboard} />
                        <span> New Task capture</span>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faCalendar} />
                        <span> New Task Organizer</span>
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
                <button 
                        className={styles["login-button"]} 
                        onClick={user ? logout : null}
                    >
                        {user ? 'Log Out' : 'Log In'}
                </button>
        </div>
    );
};

export default SideMenu;
