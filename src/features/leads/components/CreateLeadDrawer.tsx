'use client';

import { Drawer } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { X, User, AlertCircle } from 'lucide-react';
import { TextInputField, SelectInputField, Button, BorderRadioButton, RadioText, DatePicker } from 'ev-ui-lab';
import { useAuthStore } from '@/shared/store/authStore';
import { workspaceMembersService } from '../services/workspaceMembers.service';
import type { WorkspaceMemberItem } from '../services/workspaceMembers.service';
import {
  Lead,
  LeadStatus,
  LeadProductInterest,
  LeadSource,
  LeadPriority,
  CreateLeadPayload,
  UpdateLeadPayload,
  LEAD_STATUS_LABELS,
  LEAD_PRODUCT_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_PRIORITY_LABELS,
} from '../types/leads.types';

type Mode = 'create' | 'edit';

interface Props {
  open: boolean;
  mode: Mode;
  lead?: Lead | null;
  onClose: () => void;
  onCreate: (payload: CreateLeadPayload) => Promise<Lead>;
  onUpdate: (id: string, payload: UpdateLeadPayload) => Promise<Lead>;
}

function makeOptions<T extends string>(labels: Record<T, string>) {
  return Object.entries(labels).map(([value, label]) => ({ label: label as string, value }));
}

const STATUS_OPTIONS = makeOptions(LEAD_STATUS_LABELS);
const PRODUCT_OPTIONS = makeOptions(LEAD_PRODUCT_LABELS);
const SOURCE_OPTIONS = makeOptions(LEAD_SOURCE_LABELS);
const PRIORITY_OPTIONS = makeOptions(LEAD_PRIORITY_LABELS);

const PRODUCT_RADIO_OPTIONS = [
  { value: LeadProductInterest.HEALTH, label: 'Health' },
  { value: LeadProductInterest.MOTOR, label: 'Motor' },
  { value: LeadProductInterest.TERM, label: 'Term Life' },
  { value: LeadProductInterest.TRAVEL, label: 'Travel' },
  { value: LeadProductInterest.HOME, label: 'Home' },
  { value: LeadProductInterest.COMMERCIAL, label: 'Commercial' },
];

const SOURCE_RADIO_OPTIONS = [
  { value: LeadSource.REFERRAL, label: 'Referral' },
  { value: LeadSource.WALK_IN, label: 'Walk-in' },
  { value: LeadSource.SOCIAL_MEDIA, label: 'Social Media' },
  { value: LeadSource.COLD_CALL, label: 'Cold Call' },
  { value: LeadSource.WEBSITE, label: 'Website' },
  { value: LeadSource.OTHER, label: 'Other' },
];

const PRIORITY_RADIO_OPTIONS = [
  { value: LeadPriority.LOW, label: 'Low' },
  { value: LeadPriority.MEDIUM, label: 'Medium' },
  { value: LeadPriority.HIGH, label: 'High' },
];

const STATUS_RADIO_OPTIONS = [
  { value: LeadStatus.NEW, label: 'New' },
  { value: LeadStatus.CONTACTED, label: 'Contacted' },
  { value: LeadStatus.INTERESTED, label: 'Interested' },
  { value: LeadStatus.QUOTE_REQUIRED, label: 'Quote Req.' },
  { value: LeadStatus.QUOTE_SHARED, label: 'Quote Sent' },
  { value: LeadStatus.FOLLOW_UP, label: 'Follow-up' },
  { value: LeadStatus.CONVERTED, label: 'Converted' },
  { value: LeadStatus.LOST, label: 'Lost' },
];

const INDIA_GEO: { state: string; cities: string[] }[] = [
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Rajahmundry','Tirupati','Kadapa','Kakinada','Anantapur','Vizianagaram','Eluru','Ongole','Nandyal','Machilipatnam','Adoni','Tenali','Chittoor','Hindupur','Bhimavaram','Srikakulam','Proddatur','Madanapalle','Guntakal','Dharmavaram'] },
  { state: 'Arunachal Pradesh', cities: ['Itanagar','Naharlagun','Pasighat','Namsai','Bomdila','Ziro','Tawang','Tezu','Khonsa','Along'] },
  { state: 'Assam', cities: ['Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','Diphu','North Lakhimpur','Sivasagar','Goalpara','Haflong','Barpeta','Karimganj','Golaghat','Nalbari','Kokrajhar','Hailakandi'] },
  { state: 'Bihar', cities: ['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Bihar Sharif','Arrah','Begusarai','Katihar','Munger','Chhapra','Danapur','Saharsa','Sasaram','Hajipur','Dehri','Siwan','Motihari','Nawada','Bagaha','Buxar','Kishanganj','Sitamarhi','Jehanabad','Aurangabad','Bettiah','Samastipur','Madhubani'] },
  { state: 'Chhattisgarh', cities: ['Raipur','Bhilai','Bilaspur','Korba','Durg','Rajnandgaon','Jagdalpur','Ambikapur','Raigarh','Dhamtari','Chirmiri','Kanker','Mahasamund','Bemetara','Kawardha'] },
  { state: 'Goa', cities: ['Panaji','Margao','Vasco da Gama','Mapusa','Ponda','Bicholim','Curchorem','Sanquelim','Canacona','Quepem'] },
  { state: 'Gujarat', cities: ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Navsari','Morbi','Nadiad','Surendranagar','Bharuch','Mehsana','Bhuj','Porbandar','Palanpur','Valsad','Vapi','Gondal','Veraval','Godhra','Patan','Kalol','Botad','Amreli','Deesa','Jetpur','Wadhwan'] },
  { state: 'Haryana', cities: ['Faridabad','Gurgaon','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula','Bhiwani','Sirsa','Bahadurgarh','Jind','Thanesar','Kaithal','Rewari','Palwal','Narnaul','Fatehabad','Jhajjar','Hansi','Dabwali','Tohana'] },
  { state: 'Himachal Pradesh', cities: ['Shimla','Mandi','Solan','Dharamshala','Kullu','Hamirpur','Una','Nahan','Chamba','Bilaspur','Palampur','Baddi','Sundarnagar','Paonta Sahib','Rampur'] },
  { state: 'Jharkhand', cities: ['Ranchi','Jamshedpur','Dhanbad','Bokaro','Deoghar','Phusro','Hazaribagh','Giridih','Ramgarh','Medininagar','Chirkunda','Chaibasa','Dumka','Pakur','Gumla'] },
  { state: 'Karnataka', cities: ['Bengaluru','Mysuru','Hubballi','Mangaluru','Belagavi','Davanagere','Ballari','Vijayapura','Shivamogga','Tumakuru','Raichur','Bidar','Kalaburagi','Udupi','Hassan','Dharwad','Chikkamagaluru','Bagalkot','Gadag','Yadgir','Chitradurga','Mandya','Kolar','Ramanagara','Chikkaballapur','Koppal','Haveri'] },
  { state: 'Kerala', cities: ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Palakkad','Alappuzha','Kannur','Malappuram','Kottayam','Kasaragod','Munnar','Perinthalmanna','Vadakara','Punalur','Kayamkulam'] },
  { state: 'Madhya Pradesh', cities: ['Indore','Bhopal','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa','Murwara','Singrauli','Burhanpur','Khandwa','Bhind','Chhindwara','Guna','Shivpuri','Vidisha','Chhatarpur','Damoh','Mandsaur','Khargone','Neemuch','Pithampur','Itarsi','Sehore','Betul','Seoni','Datia'] },
  { state: 'Maharashtra', cities: ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Kalyan','Vasai-Virar','Navi Mumbai','Pimpri-Chinchwad','Kolhapur','Amravati','Nanded','Sangli','Malegaon','Jalgaon','Akola','Latur','Dhule','Ahmednagar','Chandrapur','Parbhani','Ichalkaranji','Jalna','Ambarnath','Bhiwandi','Shirdi','Yavatmal','Satara','Ratnagiri','Gondia','Wardha','Buldhana','Washim','Osmanabad'] },
  { state: 'Manipur', cities: ['Imphal','Thoubal','Bishnupur','Churachandpur','Kakching','Senapati','Ukhrul','Chandel','Jiribam'] },
  { state: 'Meghalaya', cities: ['Shillong','Tura','Jowai','Nongstoin','Williamnagar','Baghmara','Resubelpara','Mawkyrwat'] },
  { state: 'Mizoram', cities: ['Aizawl','Lunglei','Saiha','Champhai','Kolasib','Serchhip','Mamit','Lawngtlai'] },
  { state: 'Nagaland', cities: ['Kohima','Dimapur','Mokokchung','Tuensang','Wokha','Zunheboto','Mon','Phek','Kiphire','Longleng'] },
  { state: 'Odisha', cities: ['Bhubaneswar','Cuttack','Rourkela','Berhampur','Sambalpur','Puri','Balasore','Bhadrak','Baripada','Jharsuguda','Bargarh','Angul','Dhenkanal','Kendujhar','Koraput','Rayagada','Bolangir','Jeypore','Paradip','Bhawanipatna'] },
  { state: 'Punjab', cities: ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Hoshiarpur','Mohali','Gurdaspur','Ferozepur','Kapurthala','Moga','Sangrur','Pathankot','Faridkot','Muktsar','Barnala','Fazilka','Mansa','Rupnagar','Nawanshahr','Tarn Taran','Phagwara','Khanna','Abohar'] },
  { state: 'Rajasthan', cities: ['Jaipur','Jodhpur','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar','Bharatpur','Sikar','Sri Ganganagar','Pali','Tonk','Dhaulpur','Barmer','Jaisalmer','Churu','Nagaur','Jhunjhunu','Hanumangarh','Banswara','Dungarpur','Rajsamand','Bundi','Sawai Madhopur','Chittorgarh','Jalor','Dausa','Sirohi','Karauli'] },
  { state: 'Sikkim', cities: ['Gangtok','Namchi','Gyalshing','Mangan','Ravangla'] },
  { state: 'Tamil Nadu', cities: ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Tiruppur','Ranipet','Vellore','Erode','Thoothukkudi','Dindigul','Thanjavur','Kancheepuram','Nagercoil','Cuddalore','Kumbakonam','Tiruvannamalai','Sivakasi','Viluppuram','Karur','Namakkal','Tenkasi','Pudukkottai','Nagapattinam','Hosur','Udhagamandalam','Rajapalayam','Virudhunagar'] },
  { state: 'Telangana', cities: ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Mahbubnagar','Nalgonda','Adilabad','Suryapet','Miryalaguda','Ramagundam','Mancherial','Siddipet','Jagtial','Bhongir','Sangareddy','Bodhan','Secunderabad','Medak','Zaheerabad','Narayanpet'] },
  { state: 'Tripura', cities: ['Agartala','Dharmanagar','Udaipur','Kailashahar','Belonia','Ambassa','Khowai','Sabroom'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow','Kanpur','Ghaziabad','Agra','Varanasi','Meerut','Allahabad','Bareilly','Aligarh','Moradabad','Saharanpur','Gorakhpur','Noida','Firozabad','Loni','Jhansi','Muzaffarnagar','Mathura','Rampur','Shahjahanpur','Farrukhabad','Mau','Hapur','Etawah','Mirzapur','Bulandshahr','Sambhal','Amroha','Hardoi','Fatehpur','Raebareli','Orai','Sitapur','Bahraich','Unnao','Jaunpur','Lakhimpur','Hathras','Banda','Pilibhit','Barabanki','Khurja','Gonda','Mainpuri','Lalitpur','Etah','Deoria','Basti','Ballia'] },
  { state: 'Uttarakhand', cities: ['Dehradun','Haridwar','Roorkee','Haldwani','Rudrapur','Kashipur','Rishikesh','Ramnagar','Pithoragarh','Nainital','Mussoorie','Kotdwar','Almora','Tehri'] },
  { state: 'West Bengal', cities: ['Kolkata','Howrah','Durgapur','Asansol','Siliguri','Bardhaman','Malda','Baharampur','Rajpur Sonarpur','South Dum Dum','Madhyamgram','Bally','Baranagar','Jhargram','Cooch Behar','Jalpaiguri','Krishnanagar','Haldia','Ranaghat','Kharagpur','Santipur','Balurghat','Bankura','Darjeeling','Puruliya','Medinipur','Basirhat','Bongaon'] },
  { state: 'Andaman & Nicobar Islands', cities: ['Port Blair','Rangat','Diglipur','Car Nicobar'] },
  { state: 'Chandigarh', cities: ['Chandigarh'] },
  { state: 'Dadra & Nagar Haveli and Daman & Diu', cities: ['Daman','Diu','Silvassa'] },
  { state: 'Delhi', cities: ['New Delhi','Dwarka','Rohini','Janakpuri','Lajpat Nagar','Saket','Vasant Kunj','Pitampura','Preet Vihar','Shahdara','Narela','Badarpur','Najafgarh','Karol Bagh','Connaught Place','Paharganj','Laxmi Nagar','Mayur Vihar'] },
  { state: 'Jammu & Kashmir', cities: ['Srinagar','Jammu','Baramulla','Anantnag','Sopore','Udhampur','Kathua','Poonch','Rajouri','Bandipore','Ganderbal','Pulwama','Shopian','Kulgam'] },
  { state: 'Ladakh', cities: ['Leh','Kargil','Nubra','Zanskar'] },
  { state: 'Lakshadweep', cities: ['Kavaratti','Agatti','Minicoy','Androth'] },
  { state: 'Puducherry', cities: ['Puducherry','Karaikal','Mahe','Yanam'] },
];

const STATE_OPTIONS = INDIA_GEO.map((s) => ({ label: s.state, value: s.state }));

function getCityOptions(stateName: string): { label: string; value: string }[] {
  const found = INDIA_GEO.find((s) => s.state === stateName);
  if (!found) return [];
  return found.cities.map((c) => ({ label: c, value: c }));
}

const INITIAL_FORM = {
  name: '',
  mobile: '',
  email: '',
  city: '',
  state: '',
  productInterest: '' as LeadProductInterest | '',
  source: '' as LeadSource | '',
  priority: LeadPriority.MEDIUM as LeadPriority | '',
  status: LeadStatus.NEW as LeadStatus | '',
  assignedToId: '',
  nextFollowupAt: '',
  notes: '',
  lostReason: '',
};

export default function CreateLeadDrawer({ open, mode, lead, onClose, onCreate, onUpdate }: Props) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAgent = useAuthStore((s) => s.agent);
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);

  useEffect(() => {
    if (open) {
      workspaceMembersService.list().then((res) => setMembers(res.data)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && mode === 'edit' && lead) {
      setForm({
        name: lead.name,
        mobile: lead.mobile,
        email: lead.email ?? '',
        city: lead.city ?? '',
        state: lead.state ?? '',
        productInterest: lead.productInterest ?? '',
        source: lead.source ?? '',
        priority: lead.priority ?? '',
        status: lead.status ?? '',
        assignedToId: lead.assignedToId ?? '',
        nextFollowupAt: lead.nextFollowupAt ? lead.nextFollowupAt.split('T')[0] : '',
        notes: lead.notes ?? '',
        lostReason: lead.lostReason ?? '',
      });
    } else if (open && mode === 'create') {
      setForm(INITIAL_FORM);
    }
    setError(null);
  }, [open, mode, lead]);

  const assigneeOptions = useMemo(() => {
    const opts: { label: string; value: string }[] = [];
    if (currentAgent) {
      opts.push({ label: `${currentAgent.fullName} (You)`, value: currentAgent.id });
    }
    members.forEach((m) => {
      if (m.agentId !== currentAgent?.id) {
        opts.push({ label: m.agent.fullName, value: m.agentId });
      }
    });
    return opts;
  }, [members, currentAgent]);

  function set<K extends keyof typeof INITIAL_FORM>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Handles DD-MM-YYYY (ev-ui-lab DatePicker) and YYYY-MM-DD both → ISO string */
  function parseDateToISO(raw: string): string | undefined {
    if (!raw) return undefined;
    // DD-MM-YYYY format (ev-ui-lab DatePicker)
    const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyy) {
      const iso = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    // YYYY-MM-DD or ISO string
    const d = new Date(raw);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  async function handleSubmit() {
    if (!form.name.trim()) return setError('Name is required');
    if (!form.mobile.trim()) return setError('Mobile is required');
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) return setError('Enter a valid 10-digit mobile number');

    setLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        const payload: CreateLeadPayload = {
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          ...(form.email && { email: form.email.trim() }),
          ...(form.city && { city: form.city.trim() }),
          ...(form.state && { state: form.state.trim() }),
          ...(form.productInterest && { productInterest: form.productInterest as LeadProductInterest }),
          ...(form.source && { source: form.source as LeadSource }),
          ...(form.priority && { priority: form.priority as LeadPriority }),
          ...(form.assignedToId && { assignedToId: form.assignedToId.trim() }),
          ...(form.nextFollowupAt && { nextFollowupAt: parseDateToISO(form.nextFollowupAt) }),
          ...(form.notes && { notes: form.notes.trim() }),
        };
        await onCreate(payload);
      } else if (lead) {
        const payload: UpdateLeadPayload = {
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          productInterest: (form.productInterest as LeadProductInterest) || undefined,
          source: (form.source as LeadSource) || undefined,
          priority: (form.priority as LeadPriority) || undefined,
          status: (form.status as LeadStatus) || undefined,
          assignedToId: form.assignedToId.trim() || undefined,
          nextFollowupAt: parseDateToISO(form.nextFollowupAt),
          notes: form.notes.trim() || undefined,
          lostReason: form.lostReason.trim() || undefined,
        };
        await onUpdate(lead.id, payload);
      }
      onClose();
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 520 }, borderRadius: '16px 0 0 16px', overflow: 'hidden' } } }}
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-slate-100 ${isEdit ? 'bg-gradient-to-r from-violet-50 to-white' : 'bg-gradient-to-r from-blue-50 to-white'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isEdit ? 'bg-violet-100' : 'bg-blue-100'}`}>
                <User className={`w-5 h-5 ${isEdit ? 'text-violet-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {isEdit ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEdit ? 'Update lead information' : 'Capture a new prospect'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/80 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Basic Info ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Basic Info</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-3">
              <TextInputField
                title="Full Name *"
                attrName="name"
                value={form.name}
                value_update={(_, v) => set('name', v)}
                placeholder="e.g. Rahul Sharma"
                disabled={loading}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextInputField
                  title="Mobile *"
                  attrName="mobile"
                  value={form.mobile}
                  value_update={(_, v) => set('mobile', v)}
                  placeholder="10-digit mobile"
                  disabled={loading}
                />
                <TextInputField
                  title="Email"
                  attrName="email"
                  value={form.email}
                  value_update={(_, v) => set('email', v)}
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectInputField
                  title="State"
                  attrName="state"
                  value={form.state}
                  value_update={(_, v) => setForm((prev) => ({ ...prev, state: v, city: '' }))}
                  options={STATE_OPTIONS}
                  disabled={loading}
                />
                <SelectInputField
                  title="City"
                  attrName="city"
                  value={form.city}
                  value_update={(_, v) => set('city', v)}
                  options={getCityOptions(form.state)}
                  disabled={loading || !form.state}
                  placeholder={form.state ? 'Select city' : 'Select state first'}
                />
              </div>
              {/* Assign To */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <SelectInputField
                    title="Assign To"
                    attrName="assignedToId"
                    value={form.assignedToId}
                    value_update={(_, v) => set('assignedToId', v)}
                    options={[{ label: 'Unassigned', value: '' }, ...assigneeOptions]}
                    disabled={loading}
                  />
                </div>
                {currentAgent && (
                  <button
                    type="button"
                    onClick={() => set('assignedToId', currentAgent.id)}
                    disabled={loading}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors whitespace-nowrap disabled:opacity-40"
                  >
                    Assign to me
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ── Lead Profile ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-4 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Lead Profile</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Product Interest</p>
                <BorderRadioButton
                  attrName="productInterest"
                  value={form.productInterest}
                  onChange={(v) => set('productInterest', v)}
                  options={PRODUCT_RADIO_OPTIONS}
                  count="3"
                  variant="small"
                  disabled={loading}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Lead Source</p>
                <RadioText
                  attrName="source"
                  value={form.source}
                  onChange={(v) => set('source', v)}
                  options={SOURCE_RADIO_OPTIONS}
                  count="3"
                  variant="default"
                  disabled={loading}
                />
              </div>
            </div>
          </section>

          {/* ── Priority & Status ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-4 rounded-full bg-orange-500" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Priority & Status</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Priority</p>
                <BorderRadioButton
                  attrName="priority"
                  value={form.priority}
                  onChange={(v) => set('priority', v)}
                  options={PRIORITY_RADIO_OPTIONS}
                  count="3"
                  variant="small"
                  disabled={loading}
                />
              </div>
              {isEdit && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
                  <RadioText
                    attrName="status"
                    value={form.status}
                    onChange={(v) => set('status', v)}
                    options={STATUS_RADIO_OPTIONS}
                    count="4"
                    variant="default"
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── Follow-Up ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-4 rounded-full bg-violet-500" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Follow-Up</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <DatePicker
              label="Next Follow-Up Date"
              value={form.nextFollowupAt}
              onChange={(date) => set('nextFollowupAt', date ?? '')}
              disabled={loading}
              showTodayButton
              minDate={new Date()}
            />
          </section>

          {/* ── Lost Reason (edit + lost only) ── */}
          {isEdit && form.status === LeadStatus.LOST && (
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-4 rounded-full bg-red-400" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Lost Reason</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <textarea
                rows={2}
                placeholder="Why was this lead marked as lost?"
                value={form.lostReason}
                onChange={(e) => set('lostReason', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50 resize-none"
              />
            </section>
          )}

          {/* ── Notes ── */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-4 rounded-full bg-slate-300" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Notes</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <textarea
              rows={3}
              placeholder="Add notes or remarks about this lead…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 resize-none"
            />
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
          <Button
            text="Cancel"
            className="secondaryBtn"
            size="medium"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            text={loading ? 'Saving…' : isEdit ? 'Update Lead' : 'Add Lead'}
            className="primaryBtn"
            size="medium"
            onClick={handleSubmit}
            loader={loading}
            disabled={loading}
          />
        </div>
      </div>
    </Drawer>
  );
}
