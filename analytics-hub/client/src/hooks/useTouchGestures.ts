/**
 * TOUCH GESTURES HOOK
 * Custom hook for handling touch gestures on mobile devices
 */

import { useRef, useCallback, useEffect } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
  longPressTimer?: NodeJS.Timeout;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLongPress: false,
  });

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = options;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isLongPress: false,
    };

    // Set up long press timer
    if (onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        touchState.current.isLongPress = true;
        onLongPress();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Clear long press timer if user moves
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = undefined;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      onPinch(distance);
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = undefined;
    }

    // Don't process swipe if it was a long press
    if (touchState.current.isLongPress) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    // Check if it's a tap (small movement, short duration)
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold && deltaTime < 300) {
      onTap?.();
      return;
    }

    // Check for swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold]);

  const attachTouchListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const detachTouchListeners = useCallback((element: HTMLElement) => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    attachTouchListeners,
    detachTouchListeners,
  };
};
