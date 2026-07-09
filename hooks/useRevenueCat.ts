import { useState, useEffect, useCallback } from 'react';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { Alert } from 'react-native';

// ─── RevenueCat Identifier Constants ─────────────────────────────────────────
// These must match your RevenueCat dashboard exactly.

// Model V2 (founder ruling, 2026-07-08): one auto-renewable subscription
// group behind one entitlement. The membership year is the product — the
// 75-Day Protocol (Act I) plus consolidation and re-measurement (Acts
// II–III). Day-0 cash matches the old one-time price, so CAC payback is
// unchanged, while renewals add the recurring-revenue tail.
export const RC_ENTITLEMENT_ID = 'membership';
// Grandfather clause: the retired $49.99 one-time purchase granted this
// entitlement during V1 testing. Anyone holding it is membership-equivalent
// forever — a promise made under the old model is kept under the new one.
export const RC_LEGACY_ENTITLEMENT_ID = 'Compose Pro';
export const RC_OFFERING_ID = 'default_onboarding_offer';

// Product IDs — must match App Store Connect / the RC dashboard.
// The active annual product is NEVER resolved by hardcoded id: the RC
// Experiment ($99.99 vs $69.99 annual, upward-only pricing policy) decides
// which annual product the current Offering carries, and the paywall must
// render whatever the Offering serves or the experiment readout is corrupt.
export const RC_PRODUCTS = {
  annual: 'compose_annual_9999', // $99.99/yr — primary
  annualExperiment: 'compose_annual_6999', // $69.99/yr — experiment arm
  monthly: 'compose_monthly_1799', // $17.99/mo — secondary
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueCatState {
  currentOffering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  hasMembership: boolean;
  isProcessing: boolean;
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  /** The Offering's annual package — whichever product the RC Experiment is serving. */
  getAnnualPackage: () => PurchasesPackage | undefined;
  getMonthlyPackage: () => PurchasesPackage | undefined;
}

/**
 * Membership check, grandfather-inclusive: an active `membership`
 * subscription OR the legacy one-time entitlement (which never lapses).
 * Every access decision in the app routes through this one predicate.
 */
export function hasMembershipEntitlement(info: CustomerInfo): boolean {
  return (
    typeof info.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined' ||
    typeof info.entitlements.active[RC_LEGACY_ENTITLEMENT_ID] !== 'undefined'
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRevenueCat = (): RevenueCatState => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [hasMembership, setHasMembership] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setHasMembership(hasMembershipEntitlement(info));
  };

  // Fetch offerings and current customer info on mount. Offerings retry
  // SILENTLY with backoff — a slow or offline network must never surface an
  // error anywhere in onboarding (the flow completes without prices; the
  // paywall simply omits price copy until a retry lands). This replaces the
  // old console.error path that produced the dev "[RevenueCat] Error
  // fetching offerings" banner.
  useEffect(() => {
    let cancelled = false;

    const fetchOfferings = async () => {
      const delays = [0, 2000, 5000, 12000, 30000];
      for (const delay of delays) {
        if (delay) await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;
        try {
          const offerings = await Purchases.getOfferings();
          if (offerings.current !== null) {
            if (!cancelled) setCurrentOffering(offerings.current);
            return;
          }
        } catch {
          // quiet — next backoff step
        }
      }
    };

    const fetchCustomer = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        if (!cancelled) applyCustomerInfo(info);
      } catch {
        // quiet — the customerInfo listener below heals this when RC recovers
      }
    };

    fetchOfferings();
    fetchCustomer();

    // Listen for CustomerInfo updates (e.g. subscription renewals, restores)
    const customerInfoListener = Purchases.addCustomerInfoUpdateListener((info) => {
      applyCustomerInfo(info);
    });

    return () => {
      cancelled = true;
      const listener = customerInfoListener as any;
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

  // Manually refresh CustomerInfo (call after returning from background etc.)
  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      applyCustomerInfo(info);
    } catch (e) {
      console.error('RevenueCat: refresh error', e);
    }
  }, []);

  // Term packages resolve from the CURRENT Offering, by package type first —
  // that is the RC Experiment's swap point for the annual price test. The
  // product-id fallback only covers a dashboard misconfiguration where the
  // package type wasn't set.
  const getAnnualPackage = useCallback((): PurchasesPackage | undefined => {
    const packages = currentOffering?.availablePackages ?? [];
    return (
      packages.find((p) => p.packageType === 'ANNUAL') ??
      packages.find((p) =>
        [RC_PRODUCTS.annual, RC_PRODUCTS.annualExperiment].includes(
          p.product.identifier as (typeof RC_PRODUCTS)['annual' | 'annualExperiment'],
        ),
      )
    );
  }, [currentOffering]);

  const getMonthlyPackage = useCallback((): PurchasesPackage | undefined => {
    const packages = currentOffering?.availablePackages ?? [];
    return (
      packages.find((p) => p.packageType === 'MONTHLY') ??
      packages.find((p) => p.product.identifier === RC_PRODUCTS.monthly)
    );
  }, [currentOffering]);

  // Execute a purchase — returns true if membership was granted by it.
  const purchasePackage = useCallback(
    async (pack: PurchasesPackage): Promise<boolean> => {
      try {
        setIsProcessing(true);
        const { customerInfo: info } = await Purchases.purchasePackage(pack);
        applyCustomerInfo(info);
        return hasMembershipEntitlement(info);
      } catch (e: any) {
        if (!e.userCancelled) {
          Alert.alert('Purchase Failed', e.message ?? 'Something went wrong. Please try again.');
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  // Restore previous purchases — required for App Store review compliance.
  // Copy stays calm and neutral (§8): no urgency, no blame on the "not
  // found" path — a failed restore is usually a different Apple ID, and the
  // user is anxious enough already.
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      const info = await Purchases.restorePurchases();
      applyCustomerInfo(info);

      const granted = hasMembershipEntitlement(info);

      if (granted) {
        Alert.alert('Restored', 'Your membership is active on this device.');
      } else {
        Alert.alert(
          'No Membership Found',
          "We couldn't find an active membership linked to your Apple ID.",
        );
      }
      return granted;
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message ?? 'Something went wrong.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    currentOffering,
    customerInfo,
    hasMembership,
    isProcessing,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    getAnnualPackage,
    getMonthlyPackage,
  };
};
