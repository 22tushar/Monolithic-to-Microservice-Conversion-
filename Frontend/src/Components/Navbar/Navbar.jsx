import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import Cookies from "js-cookie";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useActiveUserContext } from "../../hooks/useActiveUserContext";
import SearchResult from "../SearchResult/SearchResult";
import Overlay from "../Overlay/Overlay";
import { useSearchResultContext } from "../../hooks/useSearchContext";

const Navbar = () => {
  const { searchResultStyle, searchResultDispatch } = useSearchResultContext();
  const { activeUser } = useActiveUserContext();

  const navigate = new useNavigate();
  const [searchValue, setSearchValue] = useState();
  const [activeSearch, setActiveSearch] = useState();
  const [searchResultContainerStyle, setSearchResultContainerStyle] =
    useState("hideSearch");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setnotifications] = useState([]);
  const [user,setUser] = useState("")


  useEffect(() => {

    // fetch current post
    const fetchCurrentNoty = async () => {
      try {

        const res = await axios.get("http://localhost:8003/api/getNoty");

        if (res.status === 200) {
          console.log(res.data.not);
          setnotifications(res.data.not)
          
        } else {
          console.log("Noty ost not found");
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCurrentNoty();
  }, []);


  // handle logout
  const handleLogout = () => {
    Cookies.remove("jwt");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // handle search
  const handleSearch = () => {
    if (searchResultContainerStyle === "hideSearch") {
      setSearchResultContainerStyle("showSearch");
    } else {
      setSearchResultContainerStyle("hideSearch");
    }
  };

  // handle notifications toggle
  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="navbar">
      {searchResultContainerStyle === "showSearch" ? (
        <>
          <SearchResult
            searchValue={searchValue}
            className={searchResultContainerStyle}
          />
          <Overlay
            className={searchResultContainerStyle}
            onClick={handleSearch}
          />
        </>
      ) : (
        ""
      )}

      <div className="left">
        <div className="logo">
          <Link to="/">Blog Bus</Link>
        </div>
      </div>

      {activeUser ? (
        <div className="center">
          <div className="search_wrapper">
            <input
              type="text"
              placeholder="Search something ...."
              onChange={(e) => {
                setSearchValue(e.target.value.toLowerCase());
              }}
              onFocus={handleSearch}
            />
            <SearchIcon className="search-icon-nav" />
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="right">
        <div className="menu-link">
          {activeUser ? (
            <>
              <Link to="/" className="nav-item ml">Home</Link>
              <Link to="/create-post" className="nav-item ml">Create Post</Link>
              <Link to="/" onClick={handleLogout} className="nav-item ml">Logout</Link>
              <Link to={`/profile/${activeUser?._id}`} className="nav-item nav_profile_img">
                <img src={activeUser?.profileImage} alt="Profile" className="nav_profile_image" />
              </Link>
              <div className="nav-item notification-container">
                <NotificationsIcon 
                  className="notification-icon" 
                  onClick={handleToggleNotifications} 
                />
                 {showNotifications && (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div key={notification._id} className="notification-item">
                        New {notification.topic} : 
                        {notification.topic === 'Post' ? (
                          <>
                            on title: 
                            {JSON.parse(notification.messageFromKafka).savePost.title} <br/> by:
                            {JSON.parse(notification.messageFromKafka).savePost.authorId}
                          </>
                        ) : null}
                         
                          {notification.topic === 'Comment' ? (
                          <>
                            : 
                            by {JSON.parse(notification.messageFromKafka).comment.username}
                          </>
                        ) : null}
                         <br/>
                        at <small>{new Date().toLocaleString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item ml">Sign In</Link>
              <Link to="/register" className="nav-item ml">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
