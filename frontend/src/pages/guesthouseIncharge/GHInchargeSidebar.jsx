import { NavLink } from "react-router-dom";
import { ghInchargeMenu } from "./ghInchargeMenu";

function GHInchargeSidebar({ collapsed, setCollapsed }) {

    return (

        <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>

            <div className="sidebar-top">

                <div className="logo">

                    {collapsed
                        ? "ERP"
                        : "Guest House ERP"}

                </div>

                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? "☰" : "◀"}
                </button>

            </div>

            <nav className="sidebar-menu">

                {
                    ghInchargeMenu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <span className="menu-icon">
                                {item.icon}
                            </span>

                            {!collapsed &&
                                <span className="menu-text">
                                    {item.title}
                                </span>
                            }

                        </NavLink>

                    ))
                }

            </nav>

        </aside>

    );

}

export default GHInchargeSidebar;