import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// 1. Define the props (the data being passed in from the Analyse page)
interface ChartRendererProps {
  standard: string;
  semester: string;
  divisions: string[];
  graphType: string;
  isLoading: boolean;
  chartData: any[];
}

const colors: Record<string, string> = { A: '#8884d8', B: '#82ca9d', C: '#ffc658', D: '#ff7300' };

const ChartRenderer: React.FC<ChartRendererProps> = ({ 
  standard, semester, divisions, graphType, isLoading, chartData 
}) => {
  
  // 2. The empty state safety checks
  if (!standard || !semester) return <p className="graph-empty-message">Please select a Standard and Semester to fetch data.</p>;
  if (divisions.length === 0) return <p className="graph-empty-message">Please select at least one Division.</p>;
  if (!graphType) return <p className="graph-empty-message bold">Please select a Graph Type to visualize the data.</p>;
  if (isLoading) return <p className="graph-empty-message">Loading Database Averages...</p>;

  // 3. The graph rendering switch statement
  switch (graphType) {
    case 'simple-bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {divisions.map(div => <Bar key={div} dataKey={div} fill={colors[div]} name={`Division ${div}`} />)}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'stacked-bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {divisions.map(div => <Bar key={div} dataKey={div} stackId="a" fill={colors[div]} name={`Division ${div}`} />)}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'simple-line':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {divisions.map(div => <Line key={div} type="monotone" dataKey={div} stroke={colors[div]} strokeWidth={3} name={`Division ${div}`} />)}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart outerRadius={150} data={chartData}>
            {/* @ts-ignore */}
            <PolarGrid />
            {/* @ts-ignore */}
            <PolarAngleAxis dataKey="subject" />
            {/* @ts-ignore */}
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {divisions.map(div => <Radar key={div} name={`Division ${div}`} dataKey={div} stroke={colors[div]} fill={colors[div]} fillOpacity={0.5} />)}
          </RadarChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
};

export default ChartRenderer;