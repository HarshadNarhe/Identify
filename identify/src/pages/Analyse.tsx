// 1. We imported useRef here!
import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import '../StudentRegistration.css';
import '../Analyse.css';

const colors: Record<string, string> = { A: '#8884d8', B: '#82ca9d', C: '#ffc658', D: '#ff7300' };
const allDivisionsList = ['A', 'B', 'C', 'D'];

const Analyse: React.FC = () => {
  const navigate = useNavigate();

  const [standard, setStandard] = useState('');
  const [semester, setSemester] = useState('');
  const [divisions, setDivisions] = useState<string[]>([]); 
  const [graphType, setGraphType] = useState('');
  
  const [isDivDropdownOpen, setIsDivDropdownOpen] = useState(false);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create the reference "boundary"
  const dropdownRef = useRef<HTMLDivElement>(null); 

  // Hook for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the dropdown is open AND the click happened outside our ref boundary...
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDivDropdownOpen(false); 
      }
    };

    // Attach the listener to the whole document
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function so we don't cause memory leaks
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty array means this only runs once when the page loads

  useEffect(() => {
    if (!standard || !semester) return; 

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/analytics?standard=${standard}&semester=${semester}`);
        setChartData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Failed to fetch chart data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [standard, semester]); 

  const handleDivToggle = (div: string) => {
    if (divisions.includes(div)) {
      setDivisions(divisions.filter(d => d !== div));
    } else {
      setDivisions([...divisions, div]);
    }
  };

  const handleSelectAllDivisions = () => {
    if (divisions.length === allDivisionsList.length) {
      setDivisions([]); 
    } else {
      setDivisions(allDivisionsList); 
    }
  };

  const renderGraph = () => {
    if (!standard || !semester) return <p className="graph-empty-message">Please select a Standard and Semester to fetch data.</p>;
    if (divisions.length === 0) return <p className="graph-empty-message">Please select at least one Division.</p>;
    if (!graphType) return <p className="graph-empty-message bold">Please select a Graph Type to visualize the data.</p>;
    if (isLoading) return <p className="graph-empty-message">Loading Database Averages...</p>;

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

  return (
    <div className="student-form-wrapper">
      <div className="analyse-form-card" style={{ maxWidth: '900px' }}>
        
        <div className="student-form-header">
          <h2>Analyse Performance</h2>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="analyse-filters-row">
          
          <div className="analyse-filter-col">
            <label className="form-label">1. Standard</label>
            <select className="form-input" value={standard} onChange={(e) => setStandard(e.target.value)}>
              <option value="" disabled>-- Select Standard --</option>
              <option value="5">Standard 5</option>
              <option value="6">Standard 6</option>
              <option value="7">Standard 7</option>
              <option value="8">Standard 8</option>
              <option value="9">Standard 9</option>
            </select>
          </div>

          <div className="analyse-filter-col">
            <label className="form-label">2. Semester</label>
            <select className="form-input" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="" disabled>-- Select Semester --</option>
              <option value="All">All Semesters (Avg)</option>
              <option value="First">First Sem</option>
              <option value="Mid">Mid Sem</option>
              <option value="Third">Third Sem</option>
              <option value="Last">Last Sem</option>
            </select>
          </div>

          {/* 4. We attached the ref to this container div! */}
          <div className="analyse-filter-col" ref={dropdownRef}>
            <label className="form-label">3. Division</label>
            
            <div className="form-input custom-dropdown-header" onClick={() => setIsDivDropdownOpen(!isDivDropdownOpen)}>
              {divisions.length === 0 ? 
                <span className="custom-dropdown-placeholder">-- Select Division --</span> : 
                <span>{divisions.length} Selected</span>
              }
              <span>▼</span>
            </div>
            
            {isDivDropdownOpen && (
              <div className="custom-dropdown-menu">
                <label className="custom-dropdown-item" style={{ fontWeight: 'bold' }}>
                  <input type="checkbox" checked={divisions.length === allDivisionsList.length} onChange={handleSelectAllDivisions} /> 
                  All Divisions
                </label>
                
                <hr className="custom-dropdown-divider" />
                
                {allDivisionsList.map(div => (
                  <label key={div} className="custom-dropdown-item">
                    <input type="checkbox" checked={divisions.includes(div)} onChange={() => handleDivToggle(div)} /> 
                    Division {div}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="analyse-filter-col">
            <label className="form-label">4. Graph Type</label>
            <select className="form-input" value={graphType} onChange={(e) => setGraphType(e.target.value)}>
              <option value="" disabled>-- Select Graph --</option>
              <option value="simple-bar">Simple Bar Chart</option>
              <option value="stacked-bar">Stacked Bar Chart</option>
              <option value="simple-line">Simple Line Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>

        </div>

        <div className="graph-display-container">
          {renderGraph()}
        </div>

      </div>
    </div>
  );
};

export default Analyse;