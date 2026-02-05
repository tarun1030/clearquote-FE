'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

type TableType = 'damage' | 'quotes' | 'repairs' | 'vehicles';
type SortDirection = 'asc' | 'desc' | null;

interface DamageDetection {
  damage_id: number;
  card_id: number;
  panel_name: string;
  damage_type: string;
  severity: string;
  confidence: number;
  detected_at: string;
}

interface Quote {
  quote_id: number;
  card_id: number;
  total_estimated_cost: number;
  currency: string;
  generated_at: string;
}

interface Repair {
  repair_id: number;
  card_id: number;
  panel_name: string;
  repair_action: string;
  repair_cost: number;
  approved: boolean;
  created_at: string;
}

interface VehicleCard {
  card_id: number;
  vehicle_type: string;
  manufacturer: string;
  model: string;
  manufacture_year: number;
  created_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    vehicle_cards?: VehicleCard[];
    damage_detections?: DamageDetection[];
    repairs?: Repair[];
    quotes?: Quote[];
  };
}

const API_ENDPOINT = 'http://127.0.0.1:8000/api/data/fetch';

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'major':
    case 'severe':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'moderate':
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'minor':
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getStatusColor = (status: boolean | string) => {
  if (typeof status === 'boolean') {
    return status
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  }
  return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
};

export default function TablesPage() {
  const [tableType, setTableType] = useState<TableType>('damage');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [vehicleData, setVehicleData] = useState<VehicleCard[]>([]);
  const [damageData, setDamageData] = useState<DamageDetection[]>([]);
  const [repairData, setRepairData] = useState<Repair[]>([]);
  const [quoteData, setQuoteData] = useState<Quote[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tables: [
            'vehicle_cards',
            'damage_detections',
            'repairs',
            'quotes',
          ],
          limit: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'success') {
        setVehicleData(result.data.vehicle_cards || []);
        setDamageData(result.data.damage_detections || []);
        setRepairData(result.data.repairs || []);
        setQuoteData(result.data.quotes || []);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(
        sortDirection === 'asc'
          ? 'desc'
          : sortDirection === 'desc'
            ? null
            : 'asc'
      );
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredData = () => {
    let data: any[] = [];

    switch (tableType) {
      case 'damage':
        data = damageData;
        break;
      case 'quotes':
        data = quoteData;
        break;
      case 'repairs':
        data = repairData;
        break;
      case 'vehicles':
        data = vehicleData;
        break;
    }

    // Filter
    let filtered = data.filter((item) => {
      const values = Object.values(item).join(' ').toLowerCase();
      return values.includes(searchQuery.toLowerCase());
    });

    // Sort
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return filtered;
  };

  const data = getSortedAndFilteredData();

  const renderTableContent = () => {
    switch (tableType) {
      case 'damage':
        return (
          <div className="overflow-x-auto h-full flex flex-col">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-md border-b border-white/20">
                <tr>
                  <TableHeader
                    label="ID"
                    column="damage_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Vehicle ID"
                    column="card_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Panel"
                    column="panel_name"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Damage Type"
                    column="damage_type"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Severity"
                    column="severity"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Confidence"
                    column="confidence"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Detected At"
                    column="detected_at"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {data.map((item: DamageDetection, idx) => (
                  <motion.tr
                    key={item.damage_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm">{item.damage_id}</td>
                    <td className="px-6 py-3 text-sm">{item.card_id}</td>
                    <td className="px-6 py-3 text-sm">{item.panel_name}</td>
                    <td className="px-6 py-3 text-sm">{item.damage_type}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{(item.confidence * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-sm">{new Date(item.detected_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'quotes':
        return (
          <div className="overflow-x-auto h-full flex flex-col">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-md border-b border-white/20">
                <tr>
                  <TableHeader
                    label="ID"
                    column="quote_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Vehicle ID"
                    column="card_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Total Cost"
                    column="total_estimated_cost"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Currency"
                    column="currency"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Generated At"
                    column="generated_at"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {data.map((item: Quote, idx) => (
                  <motion.tr
                    key={item.quote_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm">{item.quote_id}</td>
                    <td className="px-6 py-3 text-sm">{item.card_id}</td>
                    <td className="px-6 py-3 text-sm">
                      {item.currency} {item.total_estimated_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm">{item.currency}</td>
                    <td className="px-6 py-3 text-sm">{new Date(item.generated_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'repairs':
        return (
          <div className="overflow-x-auto h-full flex flex-col">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-md border-b border-white/20">
                <tr>
                  <TableHeader
                    label="ID"
                    column="repair_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Vehicle ID"
                    column="card_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Panel"
                    column="panel_name"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Action"
                    column="repair_action"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Cost"
                    column="repair_cost"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Approved"
                    column="approved"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Created At"
                    column="created_at"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {data.map((item: Repair, idx) => (
                  <motion.tr
                    key={item.repair_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm">{item.repair_id}</td>
                    <td className="px-6 py-3 text-sm">{item.card_id}</td>
                    <td className="px-6 py-3 text-sm">{item.panel_name}</td>
                    <td className="px-6 py-3 text-sm">{item.repair_action}</td>
                    <td className="px-6 py-3 text-sm">₹{item.repair_cost.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.approved)}`}
                      >
                        {item.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'vehicles':
        return (
          <div className="overflow-x-auto h-full flex flex-col">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-white/5 backdrop-blur-md border-b border-white/20">
                <tr>
                  <TableHeader
                    label="ID"
                    column="card_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Type"
                    column="vehicle_type"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Manufacturer"
                    column="manufacturer"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Model"
                    column="model"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Year"
                    column="manufacture_year"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHeader
                    label="Created At"
                    column="created_at"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {data.map((item: VehicleCard, idx) => (
                  <motion.tr
                    key={item.card_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm">{item.card_id}</td>
                    <td className="px-6 py-3 text-sm">{item.vehicle_type}</td>
                    <td className="px-6 py-3 text-sm">{item.manufacturer}</td>
                    <td className="px-6 py-3 text-sm">{item.model}</td>
                    <td className="px-6 py-3 text-sm">{item.manufacture_year}</td>
                    <td className="px-6 py-3 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="glass-card border-b border-white/10 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-semibold">Data Tables</h1>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={fetchData}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg text-sm font-medium glass-card border-white/30 text-white flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex gap-3">
            {[
              { value: 'damage', label: 'Damage Detections' },
              { value: 'quotes', label: 'Quotes' },
              { value: 'repairs', label: 'Repairs' },
              { value: 'vehicles', label: 'Vehicle Cards' },
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => {
                  setTableType(option.value as TableType);
                  setSortColumn('');
                  setSortDirection(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tableType === option.value
                    ? 'glass-card border-white/30 text-white'
                    : 'text-white/60 hover:text-white/80 border-transparent'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/40">Loading data...</div>
          </div>
        ) : data.length > 0 ? (
          renderTableContent()
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/40">No data found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface TableHeaderProps {
  label: string;
  column: string;
  sortColumn: string;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
}

function TableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const isActive = sortColumn === column;

  return (
    <th
      onClick={() => onSort(column)}
      className="px-6 py-3 text-left text-xs font-bold text-white/90 cursor-pointer hover:text-white/100 transition-colors bg-white/8 border-r border-white/10 last:border-r-0"
    >
      <div className="flex items-center gap-2">
        {label}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {sortDirection === 'asc' ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </motion.div>
        )}
      </div>
    </th>
  );
}