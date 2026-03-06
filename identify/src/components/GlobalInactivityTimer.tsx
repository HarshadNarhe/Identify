// identify/src/components/GlobalInactivityTimer.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GlobalInactivityTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. If the user is on the login or register page, we don't want the timer running!
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleLogout = () => {
      // Clear the token to officially log them out
      localStorage.removeItem('token');
      alert('Security Alert: Your session has expired due to 120 seconds of inactivity.');
      navigate('/login');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 120,000 milliseconds = 120 seconds
      timeoutId = setTimeout(handleLogout, 120000); 
    };

    // 2. Listen for any user interaction across the whole screen
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Start the timer immediately
    resetTimer(); 

    // 3. Cleanup function to stop memory leaks
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate, location.pathname]); // Re-run this check whenever the page route changes

  return null; // This component is invisible!
};

export default GlobalInactivityTimer;