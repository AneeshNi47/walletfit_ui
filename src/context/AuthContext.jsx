import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  });
  const logoutAndRedirect = () => {
  logout();
  window.location.href = '/login'; // hard redirect to clear memory
};

  useEffect(() => {
    if (auth) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const login = async (username, password, tokenData = null) => {
    try {
      let access, refresh, user;

      if (tokenData) {
        // Coming from register flow
        ({ access, refresh, user } = tokenData);
      } else {
        const res = await axios.post('users/token/', {
          username,
          password,
        });
        access = res.data.access;
        refresh = res.data.refresh;
        user = { username }; // optionally fetch user later
      }

      const authData = { access, refresh, user };
      setAuth(authData);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

 const logout = async () => {
  try {
    const refreshToken = auth?.refresh;
    if (refreshToken) {
      await axios.post(
        '/users/logout/',
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${auth?.access}`,
          },
        }
      );
    }
  } catch (err) {
    console.error('Logout failed:', err);
    // You might still want to proceed with clearing local auth
  } finally {
    setAuth(null);
    localStorage.removeItem('auth'); // if using localStorage
  }
};

  const refreshToken = async () => {
    if (!auth?.refresh) return;
    try {
      const res = await axios.post('token/refresh/', {
        refresh: auth.refresh,
      });
      setAuth((prev) => ({
        ...prev,
        access: res.data.access,
      }));
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, logoutAndRedirect, refreshToken }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
