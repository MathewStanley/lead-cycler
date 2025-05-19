import React, { useState } from 'react';
import Papa from 'papaparse';
import supabase from '../supabaseClient';

export default function SellLeads() {
  const [category, setCategory] = useState('solar');
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const requiredFields = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'street_address',
    'city',
    'state',
    'zip_code'
  ];

  const fieldOptions = {
    solar: [...new Set([...requiredFields, ...[
      'homeownership_status', 'roof_age', 'roof_type_material', 'roof_condition',
      'roof_shading', 'square_footage_of_home', 'stories', 'year_built',
      'sun_exposure_rating', 'presence_of_hoa', 'battery_ready_space', 'roof_pitch_slope',
      'property_type', 'property_ownership_length', 'credit_score_range', 'monthly_bill',
      'annual_household_income', 'employment_status', 'financing_preference',
      'previous_bankruptcy', 'home_equity_status', 'mortgage_status',
      'utility_provider', 'average_monthly_usage', 'last_months_usage', 'peak_usage_times',
      'utility_rate_plan', 'current_energy_issues', 'billing_structure', 'interest_in_battery_backup',
      'interest_in_ev_charging', 'primary_reason_for_interest', 'installation_timeframe',
      'existing_solar_system', 'contact_with_other_companies', 'requested_quotes', 'interest_in_battery',
      'interest_in_incentives', 'household_decision_maker', 'call_recording_link',
      'form_submission_recording', 'roof_square_footage', 'electric_bill_upload', 'roof_photo_upload',
      'gps_coordinates', 'sunlight_exposure_rating', 'home_energy_audit_completed', 'battery_only_interest',
      'ev_ownership', 'full_electrification_interest'
    ]])],

    hvac: [...new Set([...requiredFields, ...[
      'homeownership_status', 'property_type', 'square_footage_of_home', 'number_of_stories', 'year_built',
      'presence_of_hoa', 'age_of_current_hvac_system', 'type_of_current_hvac_system', 'current_heating_system',
      'current_cooling_system', 'condition_of_existing_system', 'fuel_type_used_heating', 'electrical_panel_size',
      'ductwork_present', 'ductwork_condition', 'thermostat_type', 'access_to_attic_basement', 'ac_system_tonnage',
      'furnace_btu_rating', 'rooftop_vs_ground_unit', 'property_accessibility', 'type_of_service_requested',
      'system_needing_service', 'installation_vs_repair', 'interest_in_heat_pump', 'timeline_for_installation_or_repair',
      'budget_range', 'interest_in_financing', 'comfort_issues_reported', 'indoor_air_quality_concerns',
      'hot_cold_spots_in_home', 'noise_complaints', 'allergies_or_health_issues', 'looking_for_high_efficiency_system',
      'brand_preferences', 'permit_requirement_awareness', 'credit_score_range', 'household_income', 'financing_preference',
      'utility_provider', 'monthly_heating_cooling_bill', 'interest_in_rebates_or_incentives', 'awareness_of_rebates',
      'qualification_for_income_based_programs', 'uploaded_utility_bill', 'uploaded_photo_of_existing_unit',
      'uploaded_thermostat_image', 'uploaded_floor_plan', 'uploaded_crawl_space_basement_access', 'uploaded_permit_documents',
      'notes_from_previous_technician', 'ev_ownership', 'electrification_interest'
    ]])],

    roofing: [...new Set([...requiredFields, ...[
      'homeownership_status', 'property_type', 'square_footage_of_home', 'number_of_stories', 'year_built', 'roof_type',
      'roof_pitch_slope', 'roof_shape', 'roof_material', 'roof_age', 'roof_condition', 'presence_of_existing_leaks',
      'number_of_layers_on_roof', 'roof_access_type', 'height_of_roof', 'attached_garage_presence',
      'skylights_or_chimneys_present', 'gutter_condition', 'attic_ventilation_status', 'ductwork_location',
      'solar_panels_installed', 'hoa_restrictions', 'historic_district_restrictions', 'type_of_service_needed',
      'reason_for_service', 'urgency_level_project_timeline', 'insurance_claim_involved', 'insurance_company_name',
      'insurance_claim_status', 'budget_range', 'preferred_roofing_material', 'color_preferences', 'warranty_interest',
      'interest_in_upgrades', 'interest_in_solar_ready_roof', 'planning_to_move_soon', 'credit_score_range',
      'household_income', 'interest_in_financing', 'awareness_of_rebates_or_incentives',
      'qualification_for_insurance_or_disaster_relief_programs', 'mortgage_status', 'uploaded_photos_of_roof_damage',
      'uploaded_insurance_documents', 'uploaded_roof_inspection_report', 'aerial_roof_imagery_available',
      'roof_measurements', 'drone_footage_or_survey_available', 'permit_requirements_known',
      'notes_from_previous_roofer_or_inspector'
    ]])]
  };

  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setCsvData(results.data);
        const headers = Object.keys(results.data[0]);
        setCsvHeaders(headers);

        const autoMapped = {};
        fieldOptions[category].forEach((field) => {
          const match = headers.find((h) => normalize(h) === normalize(field));
          if (match) autoMapped[field] = match;
        });
        setMappedFields(autoMapped);
      },
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    setMessage('');

    for (let field of requiredFields) {
      if (!mappedFields[field]) {
        setMessage(`❌ Required field not mapped: ${field}`);
        setUploading(false);
        return;
      }
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setMessage('Not signed in');
      return;
    }

    const mappedLeads = csvData.map((row) => {
      const lead = {
        type: 'aged',
        status: 'available',
        category,
        uploaded_by: user.id,
      };
      Object.keys(mappedFields).forEach((field) => {
        lead[field] = row[mappedFields[field]] || '';
      });
      return lead;
    });

    const invalidRows = mappedLeads.filter(lead =>
      requiredFields.some(field => !lead[field] || lead[field].trim() === '')
    );

    if (invalidRows.length > 0) {
      setMessage(`❌ Upload failed. ${invalidRows.length} row(s) missing required fields.`);
      setUploading(false);
      return;
    }

    const { error } = await supabase.from('leads').insert(mappedLeads);
    if (error) {
      console.error('Upload error:', error.message);
      setMessage('❌ Upload failed: ' + error.message);
    } else {
      setMessage('✅ Leads uploaded successfully!');
      setCsvData([]);
      setCsvHeaders([]);
      setMappedFields({});
    }

    setUploading(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto bg-white shadow rounded">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">📤 Sell Leads</h2>

            <div className="mb-4">
              <label className="block font-medium mb-1">Select Lead Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="solar">Solar</option>
                <option value="hvac">HVAC</option>
                <option value="roofing">Roofing</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">Upload CSV</label>
              <input type="file" accept=".csv" onChange={handleFileUpload} />
            </div>

            {csvHeaders.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Map Fields</h3>
                {fieldOptions[category].map((field) => (
                  <div key={field} className="mb-2">
                    <label className="block text-sm font-medium">
                      {requiredFields.includes(field) ? `${field} *` : field}
                    </label>
                    <select
                      value={mappedFields[field] || ''}
                      onChange={(e) =>
                        setMappedFields((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="border p-2 w-full rounded"
                    >
                      <option value="">-- Select CSV Column --</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {csvData.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {uploading ? 'Uploading...' : 'Upload Leads'}
              </button>
            )}

            {message && (
              <div className="mt-4 text-center font-medium text-sm">
                {message.includes('✅') ? (
                  <span className="text-green-600">{message}</span>
                ) : (
                  <span className="text-red-600">{message}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
