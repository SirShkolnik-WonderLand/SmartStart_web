import { useState, useEffect } from "react";

interface TypewriterOptions {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
  loop?: boolean;
}

export function useTypewriter({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  delayBetweenTexts = 2000,
  loop = true,
}: TypewriterOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || texts.length === 0) return;

    const currentText = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing
      if (displayedText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Text fully typed, wait before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenTexts);
      }
    } else {
      // Deleting
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Text fully deleted, move to next text
        setIsDeleting(false);
        if (loop) {
          setTextIndex((prev) => (prev + 1) % texts.length);
        } else {
          setTextIndex((prev) => Math.min(prev + 1, texts.length - 1));
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBetweenTexts, loop, isLoading]);

  return { displayedText, currentTextIndex: textIndex };
}
