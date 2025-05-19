import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  to,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null,
  ...rest
}) => {
  // 按钮变体
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-blue-500 hover:bg-blue-100 hover:bg-opacity-20'
  };

  // 按钮尺寸
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  };

  // 基本样式
  const baseStyles = 'rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden';
  
  // 鼠标悬停效果
  const hoverEffect = !disabled && 'transform active:scale-95';
  
  // 禁用样式
  const disabledStyles = disabled && 'opacity-50 cursor-not-allowed';
  
  // 组合所有样式
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${hoverEffect} ${disabledStyles} ${fullWidth ? 'w-full' : ''} ${className}`;

  const buttonContent = (
    <>
      {icon && <span className="inline-block">{icon}</span>}
      {children}
    </>
  );
  
  // 如果提供了to属性，渲染Link组件
  if (to) {
    return (
      <Link to={to} className={buttonStyles} {...rest}>
        {buttonContent}
      </Link>
    );
  }
  
  // 否则渲染按钮
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      {...rest}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;