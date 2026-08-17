import React, { useState, useEffect } from 'react';
import { Plus, Package as PackageIcon, CheckCircle2, Tag } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import FormModal from '../../components/modals/FormModal';
import { PackageItem } from '../../types';
import { packagesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const PackagesPage: React.FC = () => {
  const [packagesList, setPackagesList] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasPermission } = useAuth();

  const canSeeCosts = hasPermission(['pricing.cost.view', 'finance.profit.view']);

  // Package Form State
  const [packageName, setPackageName] = useState('');
  const [country, setCountry] = useState('France');
  const [visaType, setVisaType] = useState('Tourist Visa');
  const [normalTotal, setNormalTotal] = useState(157000);
  const [packagePrice, setPackagePrice] = useState(135000);
  const [discountReason, setDiscountReason] = useState('Promotional Special');

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await packagesApi.getAll();
      setPackagesList(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = normalTotal - packagePrice;
    await packagesApi.create({
      packageName,
      country,
      visaType,
      servicesIncluded: ['Tourist Visa Processing', 'VFS Appointment Support', 'Cover Letter & SOP Drafting', 'Travel Insurance'],
      normalTotal,
      packagePrice,
      discount,
      finalPrice: packagePrice,
      discountReason
    });
    setIsModalOpen(false);
    fetchPackages();
  };

  const columns: Column<PackageItem>[] = [
    { key: 'packageId', header: 'Package Code', render: (p) => <span className="font-mono text-sky-400 font-semibold">{p.packageId}</span> },
    { key: 'packageName', header: 'Package Name & Country', render: (p) => (
      <div>
        <div className="font-bold text-slate-100">{p.packageName}</div>
        <div className="text-xs text-slate-400">{p.country} — {p.visaType}</div>
      </div>
    )},
    { key: 'servicesIncluded', header: 'Included Services', render: (p) => (
      <div className="text-xs text-slate-300">
        <span className="font-semibold text-purple-400">{p.servicesIncluded.length} Bundled Services</span>
      </div>
    )},
    { key: 'normalTotal', header: 'Standard Total', render: (p) => <CurrencyDisplay amount={p.normalTotal} className="text-slate-400 text-xs line-through" /> },
    { key: 'packagePrice', header: 'Package Rate', render: (p) => (
      <div>
        <CurrencyDisplay amount={p.packagePrice} className="text-sky-400 font-bold text-sm" />
        {p.discount > 0 && (
          <div className="text-[10px] text-emerald-400 font-semibold">Saved LKR {p.discount.toLocaleString()}</div>
        )}
      </div>
    )},

    ...(canSeeCosts ? [
      { key: 'internalCost', header: 'Internal Cost', render: (p: PackageItem) => p.internalCost ? <CurrencyDisplay amount={p.internalCost} className="text-slate-400 text-xs" /> : '-' },
      { key: 'estimatedProfit', header: 'Est. Net Profit', render: (p: PackageItem) => p.estimatedProfit ? <CurrencyDisplay amount={p.estimatedProfit} className="text-emerald-400 font-bold text-xs" /> : '-' }
    ] : []),

    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Package Management"
        subtitle="Create and manage multi-service bundles, promotional discounts, and authorization logs."
        breadcrumbs={[{ label: 'Packages' }]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Package</span>
          </button>
        }
      />

      <DataTable columns={columns} data={packagesList} isLoading={isLoading} />

      {/* Package Creation Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Build New Visa Package"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePackage} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Package Name *</label>
            <input
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. Germany Schengen Student Express Package"
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Visa Type</label>
              <input
                type="text"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Standard Sum Total (LKR)</label>
              <input
                type="number"
                value={normalTotal}
                onChange={(e) => setNormalTotal(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Package Special Price (LKR)</label>
              <input
                type="number"
                value={packagePrice}
                onChange={(e) => setPackagePrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-sky-400 font-bold"
              />
            </div>
          </div>

          {normalTotal > packagePrice && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-2">
              <div className="flex justify-between font-bold text-purple-300">
                <span>Calculated Package Discount:</span>
                <span>LKR {(normalTotal - packagePrice).toLocaleString()}</span>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Discount Justification & Authorization Reason *</label>
                <input
                  type="text"
                  required
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Reason for price concession..."
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs"
            >
              Save & Activate Package
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default PackagesPage;
