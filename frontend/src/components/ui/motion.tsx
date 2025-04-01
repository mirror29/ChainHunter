"use client";

import * as React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { HTMLAttributes } from "react";

type AnimatedProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  once?: boolean;
  children: React.ReactNode;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInLeft({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInRight({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Scale({
  children,
  className,
  delay = 0,
  duration = 0.5,
  once = true,
  ...props
}: AnimatedProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered children animation
export function Stagger({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <div className={className} {...props}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<any>, {
          delay: delay + index * staggerDelay,
        });
      })}
    </div>
  );
}
