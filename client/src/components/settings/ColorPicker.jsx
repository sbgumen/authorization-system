
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const ColorPicker = ({ color, onChange, presetColors = [] }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const pickerRef = useRef(null);
  
  // 同步外部颜色
  useEffect(() => {
    setCurrentColor(color);
  }, [color]);
  
  // 处理点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);
  
  // 处理颜色变化
  const handleColorChange = (newColor) => {
    setCurrentColor(newColor);
    onChange(newColor);
    setShowPicker(false);
  };
  
  // 处理自定义颜色输入
  const handleInputChange = (e) => {
    let value = e.target.value;
    if (value.startsWith('#')) {
      setCurrentColor(value);
    } else {
      setCurrentColor(`#${value}`);
    }
  };
  
  // 处理输入框失焦时更新颜色
  const handleInputBlur = () => {
    // 简单验证十六进制颜色
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.test(currentColor)) {
      onChange(currentColor);
    } else {
      setCurrentColor(color); // 还原为原始颜色
    }
  };
  
  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 rounded-lg border-2 border-slate-600 flex items-center justify-center"
          style={{ backgroundColor: currentColor }}
        >
          <span className="sr-only">选择颜色</span>
        </button>
        <input
          type="text"
          value={currentColor}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="bg-slate-700 rounded-lg py-2 px-3 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
        />
      </div>
      
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-10 mt-2 p-3 bg-slate-700 rounded-lg shadow-lg border border-slate-600"
          >
            <div className="grid grid-cols-3 gap-2 mb-2">
              {presetColors.map((presetColor, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorChange(presetColor)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: presetColor }}
                >
                  {currentColor.toLowerCase() === presetColor.toLowerCase() && (
                    <FiCheck className="text-white stroke-2" />
                  )}
                </button>
              ))}
            </div>
            
            {/* HTML5 颜色选择器 */}
            <div className="pt-2 border-t border-slate-600">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-8 p-0 border-0 rounded cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorPicker;