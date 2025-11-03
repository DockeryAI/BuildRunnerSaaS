/**
 * Service for polishing and enhancing user interface elements
 */
export class UIPolisher {
  /**
   * Applies smooth transitions to elements
   * @param element - DOM element to enhance
   * @param duration - Transition duration in ms
   * @param easing - CSS easing function
   * @throws {Error} If invalid element or parameters provided
   */
  public static addTransition(
    element: HTMLElement,
    duration: number = 300,
    easing: string = 'ease'
  ): void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      element.style.transition = `all ${duration}ms ${easing}`;
    } catch (error) {
      console.error('Error adding transition:', error);
      throw error;
    }
  }

  /**
   * Adds hover effects to elements
   * @param element - DOM element to enhance
   * @param scale - Scale factor on hover
   * @param brightnessPercent - Brightness percent on hover
   * @throws {Error} If invalid element or parameters provided
   */
  public static addHoverEffects(
    element: HTMLElement,
    scale: number = 1.05,
    brightnessPercent: number = 105
  ): void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      element.addEventListener('mouseenter', () => {
        element.style.transform = `scale(${scale})`;
        element.style.filter = `brightness(${brightnessPercent}%)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
        element.style.filter = 'brightness(100%)';
      });
    } catch (error) {
      console.error('Error adding hover effects:', error);
      throw error;
    }
  }

  /**
   * Adds shadow effects to elements
   * @param element - DOM element to enhance
   * @param color - Shadow color
   * @param blur - Shadow blur radius
   * @param spread - Shadow spread radius
   * @throws {Error} If invalid element or parameters provided
   */
  public static addShadow(
    element: HTMLElement,
    color: string = 'rgba(0,0,0,0.1)',
    blur: number = 10,
    spread: number = 5
  ): void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      element.style.boxShadow = `0 0 ${blur}px ${spread}px ${color}`;
    } catch (error) {
      console.error('Error adding shadow:', error);
      throw error;
    }
  }

  /**
   * Adds ripple effect on click
   * @param element - DOM element to enhance
   * @param color - Ripple color
   * @throws {Error} If invalid element or parameters provided
   */
  public static addRippleEffect(
    element: HTMLElement,
    color: string = 'rgba(255,255,255,0.3)'
  ): void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      element.style.position = 'relative';
      element.style.overflow = 'hidden';

      element.addEventListener('click', (event: MouseEvent) => {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = color;
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';

        const existingRipple = element.getElementsByClassName('ripple')[0];
        if (existingRipple) {
          existingRipple.remove();
        }

        ripple.classList.add('ripple');
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.error('Error adding ripple effect:', error);
      throw error;
    }
  }

  /**
   * Adds focus outline effects
   * @param element - DOM element to enhance
   * @param color - Outline color
   * @param width - Outline width
   * @throws {Error} If invalid element or parameters provided
   */
  public static addFocusEffect(
    element: HTMLElement,
    color: string = '#4A90E2',
    width: number = 2
  ): void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      element.addEventListener('focus', () => {
        element.style.outline = 'none';
        element.style.boxShadow = `0 0 0 ${width}px ${color}`;
      });

      element.addEventListener('blur', () => {
        element.style.boxShadow = 'none';
      });
    } catch (error) {
      console.error('Error adding focus effect:', error);
      throw error;
    }
  }

  /**
   * Adds loading state to elements
   * @param element - DOM element to enhance
   * @param loadingText - Text to display while loading
   * @returns Function to remove loading state
   * @throws {Error} If invalid element or parameters provided
   */
  public static addLoadingState(
    element: HTMLElement,
    loadingText: string = 'Loading...'
  ): () => void {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      const originalContent = element.innerHTML;
      const originalCursor = element.style.cursor;
      
      element.innerHTML = loadingText;
      element.style.cursor = 'wait';
      element.setAttribute('disabled', 'true');

      return () => {
        element.innerHTML = originalContent;
        element.style.cursor = originalCursor;
        element.removeAttribute('disabled');
      };
    } catch (error) {
      console.error('Error adding loading state:', error);
      throw error;
    }
  }
}