import { useState, useEffect } from 'react';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Alert } from 'react-native';

// RevenueCat identifier constants — must match your dashboard exactly
export const RC_ENTITLEMENT_ID = 'pro_access';
export const RC_OFFERING_ID = 'default_onboarding_offer';
export const RC_PRODUCT_ID = 'compose_75day_4999';

export const useRevenueCat = () => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);

  // Fetch the active paywall offering on mount
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setCurrentOffering(offerings.current.availablePackages[0]);
        }
      } catch (e) {
        console.error('RevenueCat: Error fetching offerings', e);
      }
    };
    fetchOfferings();
  }, []);

  // Handle the actual purchase transaction
  const purchasePackage = async (pack: PurchasesPackage): Promise<boolean> => {
    try {
      setIsProcessing(true);
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (typeof customerInfo.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined') {
        setHasProAccess(true);
        return true;
      }
      return false;
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Transaction Failed', e.message);
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore previous purchases — mandatory for App Store review compliance
  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined') {
        setHasProAccess(true);
        Alert.alert('Restored', 'Your purchases have been restored.');
        return true;
      } else {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find an active subscription to restore.",
        );
        return false;
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { currentOffering, purchasePackage, restorePurchases, isProcessing, hasProAccess };
};
