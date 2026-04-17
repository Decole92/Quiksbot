"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh?: () => Promise<void>;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  attentionInterval?: number | null; // Set to null to disable the attention animation
}

export default function RefreshButton({
  onRefresh,
  className,
  variant = "default",
  size = "default",
  label = "Refresh",
  attentionInterval = 5000, // Default to 5 seconds between animations
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  // Handle the attention-grabbing animation
  useEffect(() => {
    if (attentionInterval === null) return; // Skip if animations are disabled

    // Initial delay before starting the animation cycle
    const initialDelay = setTimeout(() => {
      setIsPopping(true);
    }, 1000);

    // Set up the interval for the popping animation
    const intervalId = setInterval(() => {
      setIsPopping(true);

      // Reset the popping state after animation completes
      setTimeout(() => {
        setIsPopping(false);
      }, 1000); // Animation duration
    }, attentionInterval);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(intervalId);
    };
  }, [attentionInterval]);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setIsSuccess(false);
    setIsPopping(false); // Stop popping animation during refresh

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Simulate a refresh operation
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1500);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Define the animation classes
  const iconClasses = cn(
    "transition-all duration-300",
    isRefreshing && "animate-spin",
    isPopping && "animate-attention-pop",
    "h-4 w-4"
  );

  return (
    <>
      {/* Add the keyframes for the pop animation */}
      <style jsx global>{`
        @keyframes attention-pop {
          0% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.4);
          }
          60% {
            transform: scale(0.9);
          }
          80% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-attention-pop {
          animation: attention-pop 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @media (prefers-reduced-motion) {
          .animate-attention-pop {
            animation: none;
          }
        }
      `}</style>

      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-label={isRefreshing ? "Refreshing..." : label}
      >
        <span className='relative flex items-center'>
          {isSuccess ? (
            <Check className='h-4 w-4 text-green-500 transition-all' />
          ) : (
            <RefreshCw className={iconClasses} />
          )}
          {size !== "icon" && (
            <span className='ml-2'>
              {isRefreshing ? "Refreshing..." : isSuccess ? "Updated" : label}
            </span>
          )}
        </span>
      </Button>
    </>
  );
}
