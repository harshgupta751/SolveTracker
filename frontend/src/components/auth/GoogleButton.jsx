import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleButton({ role = 'student', label = 'Continue with Google' }) {
  const { googleLogin } = useAuthStore();
  const navigate        = useNavigate();
  const btnRef          = useRef(null);

  const handleCredential = useCallback(async (response) => {
    // response.credential is the Google ID token (a JWT)
    const result = await googleLogin(response.credential, role);
    if (result.success) {
      toast.success('Signed in with Google 🎉');
      navigate(`/${result.role}`);
    } else {
      toast.error('Google sign-in failed. Please try again.');
    }
  }, [role, googleLogin, navigate]);

  useEffect(() => {
    // Wait for the Google SDK to load
    const init = () => {
      if (!window.google || !CLIENT_ID) return;

      // Initialize the Google Identity Services library
      window.google.accounts.id.initialize({
        client_id:         CLIENT_ID,
        callback:          handleCredential,
        auto_select:       false,
        cancel_on_tap_outside: true,
      });

      // Render the button into our ref container
      window.google.accounts.id.renderButton(btnRef.current, {
        theme:     'outline',       // 'outline' | 'filled_blue' | 'filled_black'
        size:      'large',
        shape:     'rectangular',   // 'rectangular' | 'pill'
        text:      'continue_with', // 'signin_with' | 'signup_with' | 'continue_with'
        logo_alignment: 'left',
        width:     '100%',
      });
    };

    // SDK might already be loaded, or we wait for it
    if (window.google) {
      init();
    } else {
      // Poll until the SDK is available (it's loaded async in index.html)
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleCredential, CLIENT_ID]);

  if (!CLIENT_ID) {
    // Don't render if no client ID is configured
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full overflow-hidden rounded-xl"
      style={{ minHeight: 44 }}
    >
      {/* Google renders its own styled button into this div */}
      <div ref={btnRef} className="w-full" />
    </motion.div>
  );
}