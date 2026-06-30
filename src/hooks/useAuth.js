// Custom hook for managing Firebase authentication state and user session.

import { useEffect, useState } from 'react';
import { subscribeToAuth } from '../firebase/auth.js';

// Answers: "Is anyone logged in?" for any component that calls this hook.
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase calls this whenever someone logs in, logs out, or on first load
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Stop listening when the component unmounts
    return unsubscribe;
  }, []);

  return { user, loading };
};

export default useAuth;
