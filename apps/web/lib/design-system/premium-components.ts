/**
 * Premium Component Templates
 * Pre-built component templates with advanced animations and interactions
 * These serve as examples and can be injected into generated code
 */

export const PREMIUM_COMPONENT_TEMPLATES = {
  /**
   * Animated Card with hover effects and glassmorphism
   */
  AnimatedCard: `import { motion } from 'framer-motion';

export function AnimatedCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={\`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-b from-gray-900/95 to-gray-900/90
        border border-gray-800 hover:border-gray-700
        backdrop-blur-xl
        transition-all duration-300
        hover:shadow-2xl hover:shadow-primary-500/10
        \${className}
      \`}
    >
      {/* Gradient orb effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
}`,

  /**
   * Premium Hero Section with animated gradient background
   */
  HeroSection: `import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection({ title, subtitle, ctaPrimary, ctaSecondary }) {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient 15s ease infinite',
        }}
      />

      {/* Mesh pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="mesh" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" />
      </svg>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)\\'/%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 container mx-auto px-4 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium text-white">New Feature Released</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12"
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="px-8 py-4 rounded-2xl font-semibold text-white bg-white/20 backdrop-blur-xl border border-white/30 transition-all duration-200 hover:bg-white/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            {ctaPrimary}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 rounded-2xl font-semibold text-white border-2 border-white/20 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95">
            {ctaSecondary}
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-3 rounded-full bg-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}`,

  /**
   * Floating Label Input with smooth animations
   */
  FloatingLabelInput: `import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingLabelInput({ label, error, icon: Icon, ...props }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(!!e.target.value);
          }}
          className={\`
            peer w-full px-4 py-3 pt-6
            \${Icon ? 'pl-12' : ''}
            bg-gray-900/50 backdrop-blur-xl
            border \${error ? 'border-red-500' : 'border-gray-800 focus:border-primary-500'}
            rounded-xl outline-none
            transition-all duration-200
            \${error ? 'focus:ring-2 focus:ring-red-500/20' : 'focus:ring-2 focus:ring-primary-500/20'}
          \`}
        />

        <label
          className={\`
            absolute \${Icon ? 'left-12' : 'left-4'} transition-all duration-200 pointer-events-none
            \${focused || hasValue
              ? 'top-2 text-xs ' + (error ? 'text-red-400' : 'text-primary-400')
              : 'top-4 text-sm text-gray-400'
            }
          \`}
        >
          {label}
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}`,

  /**
   * Animated Button with loading states and variants
   */
  PremiumButton: `import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25',
    glass: 'backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
    ghost: 'text-gray-300 hover:bg-gray-800',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={\`
        relative inline-flex items-center justify-center gap-2
        font-medium rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        \${variants[variant]}
        \${sizes[size]}
      \`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  );
}`,

  /**
   * Staggered List with auto-animation
   */
  StaggeredList: `import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {items.map((listItem, index) => (
        <motion.li
          key={index}
          variants={item}
          className="p-4 rounded-xl bg-gray-900/50 backdrop-blur-xl border border-gray-800 hover:border-gray-700 transition-colors"
        >
          {listItem}
        </motion.li>
      ))}
    </motion.ul>
  );
}`,

  /**
   * Modal with backdrop blur and animations
   */
  PremiumModal: `import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function PremiumModal({ isOpen, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg rounded-2xl backdrop-blur-xl bg-gray-900/95 border border-gray-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}`,

  /**
   * Skeleton Loader with shimmer effect
   */
  SkeletonLoader: `export function SkeletonLoader({ className = "", count = 1, type = 'text' }) {
  const types = {
    text: 'h-4',
    title: 'h-8',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48',
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={\`
            relative overflow-hidden
            bg-gray-800 rounded-lg
            \${types[type]}
            \${className}
          \`}
        >
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
          />
        </div>
      ))}
    </div>
  );
}`,

  /**
   * Toast Notification
   */
  ToastNotification: `import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastNotification({ isVisible, onClose, type = 'info', title, message }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-300',
    error: 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-300',
    info: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-300',
    warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-300',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={\`
            fixed bottom-4 right-4 z-50
            max-w-sm w-full
            p-4 rounded-xl
            backdrop-blur-xl
            bg-gradient-to-r \${colors[type]}
            border
            shadow-2xl
          \`}
        >
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{title}</h4>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}`,
};

// Helper function to get component template by name
export function getComponentTemplate(name: keyof typeof PREMIUM_COMPONENT_TEMPLATES): string {
  return PREMIUM_COMPONENT_TEMPLATES[name] || '';
}

// Export all template names for reference
export const AVAILABLE_TEMPLATES = Object.keys(PREMIUM_COMPONENT_TEMPLATES);
