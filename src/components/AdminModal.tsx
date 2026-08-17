import React, { useState, useEffect } from 'react';
import {
  X, Lock, Shield, Plus, Edit2, Check, RefreshCw, Package, ShoppingCart,
  AlertTriangle, ShieldCheck, Key, Eye, EyeOff, LogOut, FileText, CheckCircle2,
  AlertCircle, ChevronRight, UserCheck, ShieldAlert
} from 'lucide-react';
import { Product, Order, OrderStatus, AuditLogEntry, FraudAlert } from '../types';
import { formatPrice } from '../utils/whatsapp';
import {
  adminApiLogin,
  adminApiLogout,
  adminApiCheckMe,
  adminApiGetProducts,
  adminApiUpdateProduct,
  adminApiResetProducts,
  adminApiGetOrders,
  adminApiUpdateOrderStatus,
  adminApiReviewOrder,
  adminApiGetAuditLogs,
  adminApiGetFraudAlerts
} from '../services/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsUpdated: (products: Product[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductsUpdated
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('owner_admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Portal Management State
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'audit' | 'fraud'>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // Check existing session whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setAuthChecking(true);
    setLoginError('');

    adminApiCheckMe().then(res => {
      if (!mounted) return;
      if (res.authenticated) {
        setIsAuthenticated(true);
        setAdminUsername(res.username || 'Owner Admin');
        loadAllAdminData();
      } else {
        setIsAuthenticated(false);
      }
      setAuthChecking(false);
    });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Lockout Countdown Timer
  useEffect(() => {
    if (lockoutTimer <= 0) {
      if (isLocked) setIsLocked(false);
      return;
    }
    const interval = setInterval(() => {
      setLockoutTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer, isLocked]);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [prods, ords, logs, alerts] = await Promise.all([
        adminApiGetProducts(),
        adminApiGetOrders(),
        adminApiGetAuditLogs(),
        adminApiGetFraudAlerts()
      ]);
      onProductsUpdated(prods);
      setOrders(ords);
      setAuditLogs(logs);
      setFraudAlerts(alerts);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await adminApiLogin({
        username: loginUsername.trim(),
        password: loginPassword.trim(),
        securityPin: loginPin.trim() || undefined
      });

      if (res.success && res.token) {
        setIsAuthenticated(true);
        setAdminUsername(res.username || loginUsername);
        setLoginPassword('');
        setLoginPin('');
        await loadAllAdminData();
      } else {
        setLoginError(res.error || 'Authentication rejected by server.');
        if (res.locked && res.retryAfter) {
          setIsLocked(true);
          setLockoutTimer(res.retryAfter);
        }
      }
    } catch (err) {
      setLoginError('Server communication error during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminApiLogout();
    setIsAuthenticated(false);
    setAdminUsername('');
    setLoginPassword('');
    setLoginPin('');
  };

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditForm({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm({});
  };

  const handleSaveProduct = async () => {
    if (!editingProductId) return;

    try {
      const updatedProduct = await adminApiUpdateProduct(editingProductId, {
        price: Number(editForm.price),
        originalPrice: Number(editForm.originalPrice),
        marketPrice: Number(editForm.marketPrice),
        stockCount: Number(editForm.stockCount),
        inStock: Boolean(editForm.inStock),
        badge: editForm.badge,
        shortDescription: editForm.shortDescription,
        description: editForm.description,
        howToUse: editForm.howToUse
      });

      const updatedList = products.map(p => (p.id === editingProductId ? updatedProduct : p));
      onProductsUpdated(updatedList);
      setEditingProductId(null);
      setActionSuccess(`Product '${updatedProduct.name}' updated successfully in database.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all product prices, stock, and descriptions in the server database to default values?')) {
      try {
        const defaults = await adminApiResetProducts();
        onProductsUpdated(defaults);
        setActionSuccess('All catalog prices and inventory reset to factory defaults.');
        setTimeout(() => setActionSuccess(null), 3000);
        loadAllAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to reset defaults');
      }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await adminApiUpdateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      setActionSuccess(`Order ${updated.orderNumber} status updated to '${newStatus}'.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleTrackingUpdate = async (orderId: string, trackingNumber: string) => {
    try {
      const updated = await adminApiUpdateOrderStatus(orderId, undefined, trackingNumber);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      setActionSuccess(`Tracking for ${updated.orderNumber} set to '${trackingNumber}'.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update tracking');
    }
  };

  const handleReviewOrderAction = async (orderId: string, action: 'APPROVE' | 'CANCEL') => {
    try {
      const notes = prompt(`Reason/Notes for ${action}:`, action === 'APPROVE' ? 'Owner verified payment & customer' : 'Suspicious order rejected by owner');
      const updated = await adminApiReviewOrder(orderId, action, notes || undefined);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      setActionSuccess(`Flagged Order ${updated.orderNumber} reviewed as ${action}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to review order');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div 
        className="relative bg-[#FDFBF7] w-full max-w-5xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dark Header */}
        <div className="p-4 sm:p-5 bg-[#2D332F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#3C4A3F] flex items-center justify-center text-[#E1F1E4]">
              <Shield className="w-4 h-4 text-[#A89F91]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  Store Owner Management Portal
                </h2>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 bg-[#4A5D4E] text-white text-[10px] uppercase font-bold tracking-widest rounded-xs flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Verified Owner: {adminUsername}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A89F91]">
                Owner-Only Administrative Access • Cryptographic Payment Verification Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C4A3F] hover:bg-red-900/60 text-xs font-semibold text-[#E8E2D9] hover:text-white rounded-xs transition-colors cursor-pointer"
                title="Revoke session and sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[#A89F91] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionSuccess && (
          <div className="bg-[#4A5D4E] text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#E1F1E4]" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* LOADING AUTH CHECK */}
        {authChecking ? (
          <div className="p-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#4A5D4E] animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-[#6B736E] font-bold">
              Verifying cryptographic admin authorization token...
            </p>
          </div>
        ) : !isAuthenticated ? (
          /* =========================================================
             SECURE OWNER AUTHENTICATION GATEWAY
             ========================================================= */
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto bg-[#F8F6F2]">
            <div className="max-w-md mx-auto bg-white border border-[#E8E2D9] shadow-md p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#2D332F] text-[#D5CDC0] flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2D332F]">
                  Owner Administrator Sign In
                </h3>
                <p className="text-xs text-[#6B736E] leading-relaxed">
                  Only the verified store owner can access product pricing, stock inventory, customer orders, and payment controls.
                </p>
              </div>

              {/* Lockout Warning */}
              {isLocked && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-900">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Security Account Lockout Active</span>
                  </div>
                  <p>
                    Multiple failed attempts detected. System locked for security. Retry in <strong>{lockoutTimer} seconds</strong>.
                  </p>
                </div>
              )}

              {/* Login Error */}
              {loginError && !isLocked && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#2D332F] mb-1">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    disabled={isLocked || loginLoading}
                    placeholder="Enter owner username"
                    required
                    className="w-full px-3 py-2 text-xs border border-[#E8E2D9] rounded bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#2D332F] mb-1">
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLocked || loginLoading}
                      placeholder="Enter strong admin password"
                      required
                      className="w-full px-3 py-2 pr-10 text-xs border border-[#E8E2D9] rounded bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#4A5D4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#2D332F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-[#2D332F] mb-1 flex items-center justify-between">
                    <span>Owner Security PIN (2FA)</span>
                    <span className="text-[10px] text-[#A89F91] font-normal">Optional / 4-Digits</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    disabled={isLocked || loginLoading}
                    placeholder="PIN: 8942"
                    className="w-full px-3 py-2 text-xs border border-[#E8E2D9] rounded bg-[#FDFBF7] focus:bg-white focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLocked || loginLoading}
                  className="w-full py-3 bg-[#2D332F] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying with Server...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 text-[#A89F91]" />
                      <span>Authenticate Admin Session</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#E8E2D9] text-[11px] text-[#A89F91] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#4A5D4E] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Server-Side Security Active</span>
                </div>
                <p>
                  Unauthorized attempts are recorded with client IP in immutable audit logs. 5 failed attempts trigger an automatic 15-minute server lockout.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             AUTHENTICATED STORE OWNER MANAGEMENT PORTAL
             ========================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#E8E2D9] bg-[#F8F6F2] px-6 pt-3 space-x-6 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'products'
                    ? 'border-[#4A5D4E] text-[#4A5D4E]'
                    : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Product Inventory ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-[#4A5D4E] text-[#4A5D4E]'
                    : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Verified Orders ({orders.length})</span>
                {orders.some(o => o.fraudStatus === 'REVIEW_REQUIRED') && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] rounded-full font-bold animate-pulse">
                    Review
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'audit'
                    ? 'border-[#4A5D4E] text-[#4A5D4E]'
                    : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Immutable Audit Logs ({auditLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('fraud')}
                className={`pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'fraud'
                    ? 'border-[#4A5D4E] text-[#4A5D4E]'
                    : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Fraud Alerts ({fraudAlerts.length})</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* ====================================================
                  TAB 1: PRODUCT INVENTORY & PRICING
                  ==================================================== */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#2D332F]">
                        Live Catalog Formulations & Pricing
                      </h3>
                      <p className="text-xs text-[#6B736E]">
                        All price, stock, and formulation edits are verified server-side and recorded in the audit log.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleResetDefaults}
                        className="px-3 py-1.5 border border-[#E8E2D9] bg-white text-xs font-semibold text-[#6B736E] hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="border border-[#E8E2D9] overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8F6F2] border-b border-[#E8E2D9] text-[#6B736E] uppercase tracking-wider font-semibold">
                          <th className="p-3">Product</th>
                          <th className="p-3">Category</th>
                          <th className="p-3 text-right">Selling Price</th>
                          <th className="p-3 text-right">MRP (Orig)</th>
                          <th className="p-3 text-right">Market Comp.</th>
                          <th className="p-3 text-center">Stock Count</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E2D9]">
                        {products.map(product => {
                          const isEditing = editingProductId === product.id;

                          return (
                            <tr key={product.id} className="hover:bg-[#FAF9F5] transition-colors">
                              {/* Product Info */}
                              <td className="p-3 max-w-[220px]">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover border border-[#E8E2D9] shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-[#2D332F] line-clamp-1">
                                      {product.name}
                                    </div>
                                    <div className="text-[10px] text-[#A89F91]">
                                      {product.size} • {product.packagingType}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-[#F8F6F2] border border-[#E8E2D9] text-[10px] uppercase font-bold text-[#6B736E]">
                                  {product.category}
                                </span>
                              </td>

                              {/* Selling Price */}
                              <td className="p-3 text-right font-bold text-[#2D332F]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.price || ''}
                                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    className="w-20 p-1 border border-[#4A5D4E] text-right text-xs bg-white"
                                  />
                                ) : (
                                  formatPrice(product.price)
                                )}
                              </td>

                              {/* MRP Price */}
                              <td className="p-3 text-right text-[#A89F91]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.originalPrice || ''}
                                    onChange={(e) => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                                    className="w-20 p-1 border border-[#4A5D4E] text-right text-xs bg-white"
                                  />
                                ) : (
                                  <span className="line-through">{formatPrice(product.originalPrice)}</span>
                                )}
                              </td>

                              {/* Market Price */}
                              <td className="p-3 text-right text-[#A89F91]">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.marketPrice || ''}
                                    onChange={(e) => setEditForm({ ...editForm, marketPrice: Number(e.target.value) })}
                                    className="w-20 p-1 border border-[#4A5D4E] text-right text-xs bg-white"
                                  />
                                ) : (
                                  formatPrice(product.marketPrice)
                                )}
                              </td>

                              {/* Stock */}
                              <td className="p-3 text-center">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editForm.stockCount || 0}
                                    onChange={(e) => setEditForm({ ...editForm, stockCount: Number(e.target.value) })}
                                    className="w-16 p-1 border border-[#4A5D4E] text-center text-xs bg-white"
                                  />
                                ) : (
                                  <span className={`font-semibold ${product.stockCount < 10 ? 'text-amber-700' : 'text-[#2D332F]'}`}>
                                    {product.stockCount} units
                                  </span>
                                )}
                              </td>

                              {/* In Stock Badge */}
                              <td className="p-3 text-center">
                                {isEditing ? (
                                  <input
                                    type="checkbox"
                                    checked={editForm.inStock ?? product.inStock}
                                    onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })}
                                    className="w-4 h-4 accent-[#4A5D4E]"
                                  />
                                ) : product.inStock ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                    IN STOCK
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">
                                    OUT OF STOCK
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-3 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={handleSaveProduct}
                                      className="px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="px-2 py-1 bg-[#E8E2D9] text-[#2D332F] text-[11px] font-bold hover:bg-[#D5CDC0] transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleStartEdit(product)}
                                    className="px-2.5 py-1 border border-[#E8E2D9] hover:border-[#4A5D4E] hover:text-[#4A5D4E] text-[#6B736E] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ====================================================
                  TAB 2: VERIFIED ORDERS & FULFILLMENT
                  ==================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[#E8E2D9]">
                    <h3 className="font-serif text-lg font-bold text-[#2D332F]">
                      Customer Orders & Cryptographic Payment Ledger
                    </h3>
                    <p className="text-xs text-[#6B736E]">
                      Orders are confirmed exclusively upon cryptographic server/gateway verification. Tampered or unverified payments are flagged for review.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-[#E8E2D9] text-xs text-[#6B736E]">
                      No customer orders currently in database.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div
                          key={order.id}
                          className="p-4 sm:p-5 bg-white border border-[#E8E2D9] shadow-xs space-y-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[#E8E2D9]">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono font-bold text-sm text-[#2D332F]">
                                  {order.orderNumber}
                                </span>
                                <span className="text-[11px] text-[#A89F91]">
                                  {new Date(order.createdAt).toLocaleString()}
                                </span>
                                {order.fraudStatus === 'REVIEW_REQUIRED' && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-xs flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Review Required
                                  </span>
                                )}
                                {order.fraudStatus === 'CLEARED' && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-xs flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Security Cleared
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#2D332F] font-semibold mt-1">
                                {order.customer?.fullName || 'Customer'} • {order.customer?.phone || 'No phone'} • {order.customer?.city || ''}, {order.customer?.state || ''} {order.customer?.pinCode ? `(${order.customer.pinCode})` : ''}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-serif text-base font-bold text-[#2D332F]">
                                {formatPrice(order.total)}
                              </div>
                              <span className="text-[10px] text-[#6B736E] uppercase font-bold">
                                {order.paymentMethod.toUpperCase()} • {order.paymentStatus === 'paid' ? 'PAID ✅' : 'PENDING ⏳'}
                              </span>
                            </div>
                          </div>

                          {/* Cryptographic Payment Verification Stamp */}
                          {order.paymentVerification && (
                            <div className="p-2.5 bg-[#F8F6F2] border border-[#E8E2D9] rounded-xs text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-[#4A5D4E]">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                  <strong>Gateway Txn:</strong> {order.paymentVerification.transactionId}
                                </span>
                              </div>
                              <div className="text-[#6B736E]">
                                Verified Amount: ₹{order.paymentVerification.verifiedAmount} • Signature: Valid • {new Date(order.paymentVerification.verifiedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          )}

                          {/* Items Breakdown */}
                          <div className="space-y-1 text-xs">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[#6B736E]">
                                <span>{it.quantity}x {it.name} ({it.size})</span>
                                <span className="font-medium text-[#2D332F]">{formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Order Review Controls (if flagged) */}
                          {order.fraudStatus === 'REVIEW_REQUIRED' && (
                            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <strong>Fraud Risk Reason:</strong> {order.fraudReason || 'Velocity / Order anomaly flagged by server'}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleReviewOrderAction(order.id, 'APPROVE')}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase rounded-xs cursor-pointer"
                                >
                                  Approve Order
                                </button>
                                <button
                                  onClick={() => handleReviewOrderAction(order.id, 'CANCEL')}
                                  className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] uppercase rounded-xs cursor-pointer"
                                >
                                  Cancel & Flag
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Status and Tracking Dispatch */}
                          <div className="pt-2 border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-[#A89F91]">Fulfillment:</span>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 text-xs border border-[#E8E2D9] bg-[#FDFBF7] font-semibold text-[#2D332F]"
                              >
                                <option value="PENDING_PAYMENT">Pending Payment</option>
                                <option value="ORDER_CONFIRMED">Order Confirmed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="ORDER_CANCELLED">Cancelled</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-[#A89F91]">Tracking AWB:</span>
                              <input
                                type="text"
                                defaultValue={order.trackingNumber || ''}
                                onBlur={(e) => handleTrackingUpdate(order.id, e.target.value)}
                                placeholder="Enter Courier AWB"
                                className="px-2 py-1 text-xs border border-[#E8E2D9] bg-[#FDFBF7] w-36 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ====================================================
                  TAB 3: IMMUTABLE AUDIT LOGS
                  ==================================================== */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#2D332F]">
                        Immutable Security & Administrative Audit Log
                      </h3>
                      <p className="text-xs text-[#6B736E]">
                        Every price modification, inventory change, login attempt, and payment verification event is cryptographically recorded.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {['ALL', 'AUTH', 'PRICE', 'STOCK', 'PAYMENT', 'SECURITY'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setAuditFilter(cat)}
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-xs cursor-pointer ${
                            auditFilter === cat
                              ? 'bg-[#4A5D4E] text-white'
                              : 'bg-white border border-[#E8E2D9] text-[#6B736E]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-[#E8E2D9] overflow-x-auto bg-white">
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-[#F8F6F2] border-b border-[#E8E2D9] text-[#6B736E] uppercase tracking-wider font-semibold">
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Details</th>
                          <th className="p-3">Actor / IP</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E2D9] font-mono text-[11px]">
                        {auditLogs
                          .filter(l => auditFilter === 'ALL' || l.category === auditFilter)
                          .map(log => (
                            <tr key={log.id} className="hover:bg-[#FAF9F5]">
                              <td className="p-3 text-[#6B736E] whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3 font-bold text-[#4A5D4E]">
                                {log.category}
                              </td>
                              <td className="p-3 font-semibold text-[#2D332F]">
                                {log.action}
                              </td>
                              <td className="p-3 font-sans text-xs text-[#2D332F] max-w-sm">
                                {log.details}
                              </td>
                              <td className="p-3 text-[#A89F91] whitespace-nowrap">
                                {log.adminId || 'ANON'} {log.ip ? `(${log.ip})` : ''}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
                                  log.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.status === 'WARNING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ====================================================
                  TAB 4: FRAUD & DEFENSE DASHBOARD
                  ==================================================== */}
              {activeTab === 'fraud' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[#E8E2D9]">
                    <h3 className="font-serif text-lg font-bold text-[#2D332F]">
                      Active Threat & Fraud Detection Dashboard
                    </h3>
                    <p className="text-xs text-[#6B736E]">
                      Automated threat signals, rate limiting, and price manipulation defense logs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border border-[#E8E2D9] space-y-1">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#A89F91]">
                        Brute-Force Rate Limiting
                      </div>
                      <div className="text-xl font-bold text-[#2D332F] flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Active (5 Tries / 15m)</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-[#E8E2D9] space-y-1">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#A89F91]">
                        Payment Verification Engine
                      </div>
                      <div className="text-xl font-bold text-[#2D332F] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>HMAC-SHA256 Signed</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-[#E8E2D9] space-y-1">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#A89F91]">
                        Open Fraud Alerts
                      </div>
                      <div className="text-xl font-bold text-[#2D332F]">
                        {fraudAlerts.filter(a => a.status === 'OPEN').length} Open
                      </div>
                    </div>
                  </div>

                  {/* Alerts List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D332F]">
                      Security Alert Incident Log
                    </h4>

                    {fraudAlerts.length === 0 ? (
                      <div className="p-8 bg-white border border-[#E8E2D9] text-center text-xs text-[#6B736E]">
                        Zero fraud alerts recorded. System integrity is 100% healthy.
                      </div>
                    ) : (
                      fraudAlerts.map(alert => (
                        <div key={alert.id} className="p-4 bg-white border border-amber-200 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-xs ${
                                alert.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {alert.severity} SEVERITY
                              </span>
                              <span className="font-mono text-xs text-[#6B736E]">
                                IP: {alert.ip} • {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#2D332F] font-semibold">
                              {alert.reason}
                            </p>
                          </div>

                          <span className="text-[10px] uppercase font-bold text-[#A89F91]">
                            Status: {alert.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
