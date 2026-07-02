import { useState, useEffect, useCallback } from 'react';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';
import { Alert } from 'react-native';

// ─── RevenueCat Identifier Constants ─────────────────────────────────────────
// These must match your RevenueCat dashboard exactly.

// Granted permanently by the $49.99 one-time program purchase — gates the
// core 75-day protocol and app access.
export const RC_ENTITLEMENT_ID = 'Compose Pro';
// Granted only while the $4.99/mo continuation is active — gates the
// post-Day-75 Somatic Maintenance Toolkit, streaks, and interactive logs.
// Lapses on cancellation, unlike RC_ENTITLEMENT_ID.
export const RC_MAINTENANCE_ENTITLEMENT_ID = 'Maintenance Toolkit';
export const RC_OFFERING_ID = 'default_onboarding_offer';

// Product IDs — must match App Store Connect / Google Play Console
export const RC_PRODUCTS = {
  program: 'compose_75day_4999',      // $49.99 one-time 75-day program
  continuation: 'compose_monthly_499', // $4.99/month post-Day-75 membership
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueCatState {
  currentOffering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  hasProAccess: boolean;
  hasMaintenanceAccess: boolean;
  isProcessing: boolean;
  purchasePackage: (pack: PurchasesPackage, entitlementId?: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  getPackageByProduct: (productId: string) => PurchasesPackage | undefined;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRevenueCat = (): RevenueCatState => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [hasMaintenanceAccess, setHasMaintenanceAccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive entitlement state from customerInfo — checked independently since
  // the base program purchase and the monthly continuation grant different
  // entitlements (see RC_ENTITLEMENT_ID / RC_MAINTENANCE_ENTITLEMENT_ID).
  const checkEntitlement = (info: CustomerInfo, entitlementId: string): boolean => {
    return typeof info.entitlements.active[entitlementId] !== 'undefined';
  };

  const applyCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setHasProAccess(checkEntitlement(info, RC_ENTITLEMENT_ID));
    setHasMaintenanceAccess(checkEntitlement(info, RC_MAINTENANCE_ENTITLEMENT_ID));
  };

  // Fetch offerings and current customer info on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const [offerings, info] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(),
        ]);

        if (offerings.current !== null) {
          setCurrentOffering(offerings.current);
        }

        applyCustomerInfo(info);
      } catch (e) {
        console.error('RevenueCat: initialization error', e);
      }
    };

    initialize();

    // Listen for CustomerInfo updates (e.g. subscription renewals, restores)
    const customerInfoListener = Purchases.addCustomerInfoUpdateListener((info) => {
      applyCustomerInfo(info);
    });

    return () => {
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

  // Find a specific package by product identifier within the current offering
  const getPackageByProduct = useCallback(
    (productId: string): PurchasesPackage | undefined => {
      return currentOffering?.availablePackages.find(
        (p) => p.product.identifier === productId,
      );
    },
    [currentOffering],
  );

  // Execute a purchase — returns true if the given entitlement (defaults to
  // the base program entitlement) was granted by this purchase.
  const purchasePackage = useCallback(
    async (
      pack: PurchasesPackage,
      entitlementId: string = RC_ENTITLEMENT_ID,
    ): Promise<boolean> => {
      try {
        setIsProcessing(true);
        const { customerInfo: info } = await Purchases.purchasePackage(pack);
        applyCustomerInfo(info);
        return checkEntitlement(info, entitlementId);
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

  // Restore previous purchases — required for App Store review compliance
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      const info = await Purchases.restorePurchases();
      applyCustomerInfo(info);

      const granted = checkEntitlement(info, RC_ENTITLEMENT_ID);

      if (granted) {
        Alert.alert('Restored', 'Your Compose Pro access has been restored.');
      } else {
        Alert.alert(
          'No Active Subscription',
          "We couldn't find an active Compose Pro subscription linked to your Apple ID.",
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
    hasProAccess,
    hasMaintenanceAccess,
    isProcessing,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
    getPackageByProduct,
  };
};
