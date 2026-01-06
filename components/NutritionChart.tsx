
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionData } from '../types';

interface NutritionChartProps {
  data: NutritionData;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Protein', value: data.protein, color: '#f59e0b' },
    { name: 'Carbs', value: data.carbs, color: '#10b981' },
    { name: 'Fats', value: data.fats, color: '#ef4444' },
    { name: 'Fiber', value: data.fiber, color: '#8b5cf6' },
  ];

  return (
    <div className="h-64 w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Nutritional Balance (g)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NutritionChart;
