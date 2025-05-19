// client/src/components/dashboard/LicenseChart.jsx
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion } from 'framer-motion';

const LicenseChart = ({ stats }) => {
  // 如果没有数据，显示空状态
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">暂无统计数据</p>
      </div>
    );
  }

  // 准备图表数据
  const data = [
    { name: '待授权', value: stats.pending || 0, color: '#EAB308' }, // 黄色
    { name: '已激活', value: stats.active || 0, color: '#22C55E' },  // 绿色
    { name: '已过期', value: stats.expired || 0, color: '#EF4444' },  // 红色
    { name: '已撤销', value: stats.revoked || 0, color: '#6B7280' }   // 灰色
  ].filter(item => item.value > 0); // 只显示有值的数据

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-3 rounded-lg shadow-lg text-white border border-slate-600">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-xs text-gray-400">{`占比: ${((payload[0].value / stats.total) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // 自定义图例
  const CustomLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <motion.li 
            key={`legend-${index}`}
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-sm">{entry.value}: {entry.payload.value}</span>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div 
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={5}
            dataKey="value"
            animationBegin={200}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="rgba(0, 0, 0, 0.1)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LicenseChart;