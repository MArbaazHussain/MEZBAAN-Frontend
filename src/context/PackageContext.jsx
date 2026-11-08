import { createContext, useContext, useEffect, useState } from 'react';

// Package Builder ka "draft" - browser me save rehta hai jab tak customer save na kare
const PackageContext = createContext(null);

const emptyDraft = {
  packageId: null,          // agar saved package edit ho raha hai
  packageName: 'My Event Package',
  eventType: 'Wedding',
  eventDate: '',
  eventLocation: '',
  guestCount: 200,
  budgetLimit: 0,
  items: []                 // { serviceId, title, basePrice, pricingUnit, category, quantity }
};

export function PackageProvider({ children }) {
  const [draft, setDraft] = useState(() => {
    try { return { ...emptyDraft, ...JSON.parse(localStorage.getItem('mezbaan_draft')) }; } catch { return emptyDraft; }
  });

  useEffect(() => {
    try { localStorage.setItem('mezbaan_draft', JSON.stringify(draft)); } catch { /* ignore */ }
  }, [draft]);

  const addService = (s) => {
    setDraft((d) => {
      if (d.items.some((i) => i.serviceId === s._id)) return d;
      return {
        ...d,
        items: [...d.items, {
          serviceId: s._id,
          title: s.title,
          basePrice: s.basePrice,
          pricingUnit: s.pricingUnit,
          category: s.categoryId?.categoryName || '',
          quantity: 1
        }]
      };
    });
  };

  const removeService = (id) => setDraft((d) => ({ ...d, items: d.items.filter((i) => i.serviceId !== id) }));

  const setQuantity = (id, quantity) => setDraft((d) => ({
    ...d,
    items: d.items.map((i) => (i.serviceId === id ? { ...i, quantity } : i))
  }));

  const updateField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const clearDraft = () => setDraft(emptyDraft);

  // Saved package ko builder me kholna (edit ke liye)
  const loadPackage = (pkg) => setDraft({
    packageId: pkg._id,
    packageName: pkg.packageName,
    eventType: pkg.eventType || 'Wedding',
    eventDate: pkg.eventDate ? pkg.eventDate.slice(0, 10) : '',
    eventLocation: pkg.eventLocation || '',
    guestCount: pkg.guestCount,
    budgetLimit: pkg.budgetLimit,
    items: pkg.items
      .filter((i) => i.serviceId)
      .map((i) => ({
        serviceId: i.serviceId._id,
        title: i.serviceId.title,
        basePrice: i.serviceId.basePrice,
        pricingUnit: i.serviceId.pricingUnit,
        category: i.serviceId.categoryId?.categoryName || '',
        quantity: i.quantity
      }))
  });

  const has = (id) => draft.items.some((i) => i.serviceId === id);

  return (
    <PackageContext.Provider value={{ draft, addService, removeService, setQuantity, updateField, clearDraft, loadPackage, has }}>
      {children}
    </PackageContext.Provider>
  );
}

export const usePackage = () => useContext(PackageContext);
