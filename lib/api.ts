const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface VehicleCard {
  card_id: number;
  vehicle_type: string;
  manufacturer: string;
  model: string;
  manufacture_year: number;
  created_at: string;
}

export interface DamageDetection {
  damage_id: number;
  card_id: number;
  panel_name: string;
  damage_type: string;
  severity: string;
  confidence: number;
  detected_at: string;
}

export interface Repair {
  repair_id: number;
  card_id: number;
  panel_name: string;
  repair_action: string;
  repair_cost: number;
  approved: boolean;
  created_at: string;
}

export interface Quote {
  quote_id: number;
  card_id: number;
  total_estimated_cost: number;
  currency: string;
  generated_at: string;
}

export interface FetchDataResponse {
  status: string;
  message: string;
  data: {
    vehicle_cards: VehicleCard[];
    damage_detections: DamageDetection[];
    repairs: Repair[];
    quotes: Quote[];
  };
}

export async function fetchTableData(limit: number = 200): Promise<FetchDataResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/data/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tables: ['vehicle_cards', 'damage_detections', 'repairs', 'quotes'],
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: FetchDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching table data:', error);
    throw error;
  }
}
