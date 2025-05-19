import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const FIELD_OPTIONS = {
  solar: [
    'homeownership_status', 'roof_age', 'roof_type_material', 'roof_condition', 'roof_shading',
    'square_footage_of_home', 'stories', 'year_built', 'sun_exposure_rating', 'presence_of_hoa',
    'battery_ready_space', 'roof_pitch_slope', 'property_type', 'property_ownership_length',
    'credit_score_range', 'monthly_bill', 'annual_household_income', 'employment_status',
    'financing_preference', 'previous_bankruptcy', 'home_equity_status', 'mortgage_status',
    'utility_provider', 'average_monthly_usage', 'last_months_usage', 'peak_usage_times',
    'utility_rate_plan', 'current_energy_issues', 'billing_structure', 'interest_in_battery_backup',
    'interest_in_ev_charging', 'primary_reason_for_interest', 'installation_timeframe',
    'existing_solar_system', 'contact_with_other_companies', 'requested_quotes', 'interest_in_battery',
    'interest_in_incentives', 'household_decision_maker', 'call_recording_link', 'form_submission_recording',
    'roof_square_footage', 'electric_bill_upload', 'roof_photo_upload', 'gps_coordinates',
    'sunlight_exposure_rating', 'home_energy_audit_completed', 'battery_only_interest', 'ev_ownership',
    'full_electrification_interest'
  ],
  hvac: [
    'homeownership_status', 'property_type', 'square_footage_of_home', 'number_of_stories', 'year_built',
    'presence_of_hoa', 'age_of_current_hvac_system', 'type_of_current_hvac_system', 'current_heating_system',
    'current_cooling_system', 'condition_of_existing_system', 'fuel_type_used_heating', 'electrical_panel_size',
    'ductwork_present', 'ductwork_condition', 'thermostat_type', 'access_to_attic_basement', 'ac_system_tonnage',
    'furnace_btu_rating', 'rooftop_vs_ground_unit', 'property_accessibility', 'type_of_service_requested',
    'system_needing_service', 'installation_vs_repair', 'interest_in_heat_pump',
    'timeline_for_installation_or_repair', 'budget_range', 'interest_in_financing', 'comfort_issues_reported',
    'indoor_air_quality_concerns', 'hot_cold_spots_in_home', 'noise_complaints', 'allergies_or_health_issues',
    'looking_for_high_efficiency_system', 'brand_preferences', 'permit_requirement_awareness', 'credit_score_range',
    'household_income', 'financing_preference', 'utility_provider', 'monthly_heating_cooling_bill',
    'interest_in_rebates_or_incentives', 'awareness_of_rebates', 'qualification_for_income_based_programs',
    'uploaded_utility_bill', 'uploaded_photo_of_existing_unit', 'uploaded_thermostat_image', 'uploaded_floor_plan',
    'uploaded_crawl_space_basement_access', 'uploaded_permit_documents', 'notes_from_previous_technician',
    'ev_ownership', 'electrification_interest'
  ],
  roofing: [
    'homeownership_status', 'property_type', 'square_footage_of_home', 'number_of_stories', 'year_built',
    'roof_type', 'roof_pitch_slope', 'roof_shape', 'roof_material', 'roof_age', 'roof_condition',
    'presence_of_existing_leaks', 'number_of_layers_on_roof', 'roof_access_type', 'height_of_roof',
    'attached_garage_presence', 'skylights_or_chimneys_present', 'gutter_condition', 'attic_ventilation_status',
    'ductwork_location', 'solar_panels_installed', 'hoa_restrictions', 'historic_district_restrictions',
    'type_of_service_needed', 'reason_for_service', 'urgency_level_project_timeline', 'insurance_claim_involved',
    'insurance_company_name', 'insurance_claim_status', 'budget_range', 'preferred_roofing_material',
    'color_preferences', 'warranty_interest', 'interest_in_upgrades', 'interest_in_solar_ready_roof',
    'planning_to_move_soon', 'credit_score_range', 'household_income', 'interest_in_financing',
    'awareness_of_rebates_or_incentives', 'qualification_for_insurance_or_disaster_relief_programs',
    'mortgage_status', 'uploaded_photos_of_roof_damage', 'uploaded_insurance_documents',
    'uploaded_roof_inspection_report', 'aerial_roof_imagery_available', 'roof_measurements',
    'drone_footage_or_survey_available', 'permit_requirements_known', 'notes_from_previous_roofer_or_inspector'
  ]
};

export default function AgedLeads() {
  const [userId, setUserId] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [industry, setIndustry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [amount, setAmount] = useState(10);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [advancedFields, setAdvancedFields] = useState([]);
  const [message, setMessage] = useState('');
  

  const costPerLead = 10 + advancedFields.length;
  const totalCost = costPerLead * amount;

  
  useEffect(() => {
    loadUser();
    fetchFilters();
  }, []);

  useEffect(() => {
    if (state) fetchCities(state);
  }, [state]);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) {
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', data.user.id)
        .single();

      setUserCoins(profile?.coins || 0);
    }
  };

  async function fetchFilters() {
    const { data, error } = await supabase
      .from('leads')
      .select('category, type, status, state, city');

    if (error) return console.error(error);

    const filtered = data.filter(d => d.type === 'aged' && d.status === 'available');
    setAvailableIndustries([...new Set(filtered.map(d => d.category).filter(Boolean))]);
    setAvailableStates([...new Set(filtered.map(d => d.state).filter(Boolean))]);
  }

  async function fetchCities(selectedState) {
    const { data, error } = await supabase
      .from('leads')
      .select('city, type, status, state')
      .eq('state', selectedState);

    if (error) return console.error(error);

    const filtered = data.filter(d => d.type === 'aged' && d.status === 'available');
    setAvailableCities([...new Set(filtered.map(d => d.city).filter(Boolean))]);
  }

  async function handlePurchase() {
    setMessage('');

    if (userCoins < totalCost) {
      setMessage('❌ Not enough coins to complete this purchase.');
      return;
    }

    let query = supabase
      .from('leads')
      .select('*')
      .eq('status', 'available')
      .eq('type', 'aged')
      .is('sold_to', null)
      .neq('uploaded_by', userId);

    if (state) query = query.eq('state', state);
    if (city) query = query.eq('city', city);
    if (industry) query = query.eq('category', industry);

    advancedFields.forEach((field) => {
      query = query.not(field, 'is', null);
    });

    const { data: leads, error } = await query.limit(amount);
    if (error || !leads.length) {
      setMessage('❌ No available leads match your criteria.');
      return;
    }

    // Deduct coins from buyer
    const { error: buyerUpdateError } = await supabase
      .from('profiles')
      .update({ coins: userCoins - totalCost })
      .eq('id', userId);

    if (buyerUpdateError) {
      setMessage('❌ Failed to update your profile.');
      return;
    }

 // Track seller coin updates
const sellerMap = {};
leads.forEach(lead => {
  if (!sellerMap[lead.uploaded_by]) sellerMap[lead.uploaded_by] = 0;
  sellerMap[lead.uploaded_by] += 10;
});

// Credit each seller
for (const [sellerId, coinsToAdd] of Object.entries(sellerMap)) {
  const { error: creditError } = await supabase.rpc('increment_coins', {
    user_id: sellerId,
    coin_amount: coinsToAdd
  });

  if (creditError) {
    console.error(`Failed to credit seller ${sellerId}:`, creditError.message);
    setMessage('❌ Failed to credit one or more sellers.');
    return;
  }
}


    // Get lead IDs for updating
const leadIds = leads.map(lead => lead.id);

// Update leads: mark sold
await supabase
  .from('leads')
  .update({ sold_to: userId, status: 'sold' })
  .in('id', leadIds);



    setMessage(`✅ Successfully purchased ${leads.length} leads.`);
    loadUser(); // refresh coin balance
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Aged Leads Marketplace</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label>State</label>
          <select className="w-full border p-2" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All</option>
            {availableStates.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>City</label>
          <select className="w-full border p-2" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All</option>
            {availableCities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label>Industry</label>
          <select className="w-full border p-2" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">Select</option>
            {availableIndustries.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label>Lead Quantity</label>
          <input type="number" className="w-full border p-2" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} />
        </div>
      </div>

      {industry && (
        <div className="mb-6">
          <h3 className="font-semibold">Advanced Filters (adds 1 coin each)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {FIELD_OPTIONS[industry].map(field => (
              <label key={field} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={advancedFields.includes(field)}
                  onChange={() => {
                    setAdvancedFields(prev =>
                      prev.includes(field)
                        ? prev.filter(f => f !== field)
                        : [...prev, field]
                    );
                  }}
                />
                {field.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 border shadow rounded mb-6">
        <h2 className="text-lg font-bold mb-2">Order Summary</h2>
        <p><strong>Cost Per Lead:</strong> {costPerLead} coins</p>
        <p><strong>Lead Quantity:</strong> {amount}</p>
        <p><strong>Total Cost:</strong> {totalCost} coins</p>
        <p className="mt-2 text-sm text-gray-500">
          File name: <code>{[state, city, industry, ...advancedFields].join('_')}</code>
        </p>
        {message && <div className="mt-2 text-sm text-red-600">{message}</div>}
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handlePurchase}
        >
          Buy Leads
        </button>
      </div>
    </div>
  );
}
