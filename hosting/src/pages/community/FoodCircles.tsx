import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MapPin, Plus, ArrowLeft, Clock, Users2,
  X, UtensilsCrossed,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  listCircles, getCircle, joinCircle, leaveCircle,
  createCircle, createGroupOrder, joinGroupOrder,
  type FoodCircle, type GroupOrder,
} from "@/services/foodCircleApi";
import { getVendorMarket, type CommunityVendor } from "@/services/communityApi";

export function FoodCircles() {
  const { id: circleId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { symbol } = useCurrency();

  const [circles, setCircles] = useState<FoodCircle[]>([]);
  const [activeCircle, setActiveCircle] = useState<FoodCircle | null>(null);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [vendors, setVendors] = useState<CommunityVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showCreateGroupOrder, setShowCreateGroupOrder] = useState(false);

  // Create circle form state
  const [circleForm, setCircleForm] = useState({
    name: "", neighborhood: "", city: "", state: "",
  });

  // Create group order form state
  const [groupOrderForm, setGroupOrderForm] = useState({
    vendorId: "", foodName: "", cuisine: "",
    targetServings: 5, pricePerServing: 0,
    totalDeliveryFee: 500, deliveryWindow: "",
    deliveryAddress: "",
  });

  // Join group order state
  const [joiningOrderId, setJoiningOrderId] = useState<string | null>(null);
  const [joinServings, setJoinServings] = useState(1);

  const loadCircles = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const data = await listCircles();
      setCircles(data);
    } catch {
      showToast("Failed to load circles");
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  const loadCircleDetails = useCallback(async (cid: string) => {
    try {
      const circle = await getCircle(cid);
      setActiveCircle(circle);
      setGroupOrders(circle.groupOrders || []);
    } catch {
      showToast("Failed to load circle details");
    }
  }, [showToast]);

  useEffect(() => {
    if (circleId) {
      loadCircleDetails(circleId);
    } else {
      loadCircles();
    }
  }, [circleId, loadCircles, loadCircleDetails]);

  useEffect(() => {
    if (showCreateGroupOrder) {
      getVendorMarket().then(setVendors).catch(() => {});
    }
  }, [showCreateGroupOrder]);

  const handleCreateCircle = async () => {
    if (!circleForm.name || !circleForm.neighborhood || !circleForm.city || !circleForm.state) {
      showToast("All fields are required");
      return;
    }
    try {
      await createCircle(circleForm);
      showToast("Circle created!");
      setShowCreateCircle(false);
      setCircleForm({ name: "", neighborhood: "", city: "", state: "" });
      loadCircles();
    } catch (err: any) {
      showToast(err.message || "Failed to create circle");
    }
  };

  const handleJoinCircle = async (cid: string) => {
    try {
      await joinCircle(cid);
      showToast("Joined circle!");
      loadCircles();
    } catch (err: any) {
      showToast(err.message || "Failed to join circle");
    }
  };

  const handleLeaveCircle = async (cid: string) => {
    try {
      await leaveCircle(cid);
      showToast("Left circle");
      loadCircles();
    } catch (err: any) {
      showToast(err.message || "Failed to leave circle");
    }
  };

  const handleCreateGroupOrder = async () => {
    if (!activeCircle || !groupOrderForm.vendorId || !groupOrderForm.foodName || !groupOrderForm.deliveryWindow || !groupOrderForm.deliveryAddress) {
      showToast("Fill all required fields");
      return;
    }
    try {
      await createGroupOrder(activeCircle.id, groupOrderForm);
      showToast("Group order created!");
      setShowCreateGroupOrder(false);
      setGroupOrderForm({
        vendorId: "", foodName: "", cuisine: "",
        targetServings: 5, pricePerServing: 0,
        totalDeliveryFee: 500, deliveryWindow: "",
        deliveryAddress: "",
      });
      loadCircleDetails(activeCircle.id);
    } catch (err: any) {
      showToast(err.message || "Failed to create group order");
    }
  };

  const handleJoinGroupOrder = async (orderId: string) => {
    try {
      const result = await joinGroupOrder(orderId, joinServings);
      showToast(`Reserved ${joinServings} servings for ${symbol}${result.amountPaid.toLocaleString()}`);
      setJoiningOrderId(null);
      setJoinServings(1);
      if (activeCircle) loadCircleDetails(activeCircle.id);
    } catch (err: any) {
      showToast(err.message || "Failed to join group order");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-32 pb-16 text-center">
          <Users className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Sign in to join Food Circles</h1>
          <p className="mt-2 text-gray-600">Pool orders with neighbors, split delivery fees, and discover local home chefs.</p>
          <Button className="mt-6 bg-orange-500 hover:bg-orange-600" asChild>
            <a href="/auth/sign-in">Sign in</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeCircle ? activeCircle.name : "Food Circles"}
            </h1>
            <p className="mt-1 text-gray-600">
              {activeCircle
                ? `${activeCircle.neighborhood}, ${activeCircle.city} — ${activeCircle.members?.length || 0} members`
                : "Pool orders with neighbors, split delivery fees, and discover local chefs."}
            </p>
          </div>
          {activeCircle && (
            <Button variant="outline" asChild>
              <Link to="/community/circles"><ArrowLeft className="mr-1 h-4 w-4" /> All circles</Link>
            </Button>
          )}
          {!activeCircle && (
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowCreateCircle(true)}>
              <Plus className="mr-1 h-4 w-4" /> Create circle
            </Button>
          )}
        </div>

        {/* Circle list view */}
        {!activeCircle && (
          <>
            {isLoading && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-3xl bg-gray-200" />
                ))}
              </div>
            )}

            {!isLoading && circles.length === 0 && (
              <div className="mt-12 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-4 text-sm font-semibold text-gray-600">No circles yet</p>
                <p className="text-xs text-gray-400">Create the first food circle in your neighborhood.</p>
              </div>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {circles.map((circle) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link to={`/community/circles/${circle.id}`} className="block">
                    <h3 className="font-bold text-gray-900">{circle.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {circle.neighborhood}, {circle.city}, {circle.state}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users2 className="h-4 w-4" />
                        {circle._count?.members || 0} members
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <UtensilsCrossed className="h-4 w-4" />
                        {circle._count?.groupOrders || 0} group orders
                      </span>
                    </div>
                  </Link>
                  <div className="mt-4">
                    {circle.isMember ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Member</span>
                        <Button variant="ghost" size="sm" onClick={() => handleLeaveCircle(circle.id)}>
                          Leave
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => handleJoinCircle(circle.id)}>
                        Join circle
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Circle detail view */}
        {activeCircle && (
          <div className="mt-8 space-y-8">
            {/* Members */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Members</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {activeCircle.members?.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                      {m.vendorProfile && (
                        <p className="text-xs text-gray-500">{m.vendorProfile.kitchenName}</p>
                      )}
                    </div>
                    {m.role === "admin" && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group orders */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Active Group Orders</h2>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowCreateGroupOrder(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Start group order
                </Button>
              </div>

              {groupOrders.length === 0 && (
                <div className="mt-4 rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <UtensilsCrossed className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-4 text-sm font-semibold text-gray-600">No active group orders</p>
                  <p className="text-xs text-gray-400">Start one to pool orders with your neighbors.</p>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {groupOrders.map((go) => {
                  const filled = go.filledServings;
                  const target = go.targetServings;
                  const pct = Math.round((filled / target) * 100);
                  const remaining = target - filled;
                  const pricePerServing = Number(go.pricePerServing);
                  const deliveryFeePerServing = Number(go.deliveryFeePerServing);
                  const totalPerServing = pricePerServing + deliveryFeePerServing;

                  return (
                    <div key={go.id} className="rounded-3xl bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{go.foodName}</h3>
                          <p className="text-sm text-gray-500">{go.cuisine} by {go.vendor.kitchenName}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(go.deliveryWindow).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {go.deliveryAddress}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Per serving</p>
                          <p className="font-bold text-gray-900">{symbol}{totalPerServing.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">(incl. {symbol}{deliveryFeePerServing} delivery)</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{filled} / {target} servings filled</span>
                          <span className="text-gray-400">{pct}%</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-orange-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Slots */}
                      {go.slots.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {go.slots.map((s) => (
                            <span key={s.id} className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                              {s.buyer.name}: {s.servings} servings
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Join section */}
                      {go.status === "open" && remaining > 0 && (
                        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                          {joiningOrderId === go.id ? (
                            <>
                              <input
                                type="number"
                                min={1}
                                max={remaining}
                                value={joinServings}
                                onChange={(e) => setJoinServings(Math.max(1, Math.min(remaining, Number(e.target.value))))}
                                className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none"
                              />
                              <span className="text-sm text-gray-500">
                                = {symbol}{(totalPerServing * joinServings).toLocaleString()}
                              </span>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleJoinGroupOrder(go.id)}>
                                Confirm
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setJoiningOrderId(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => { setJoiningOrderId(go.id); setJoinServings(1); }}>
                              Join — {remaining} spots left
                            </Button>
                          )}
                        </div>
                      )}

                      {go.status === "full" && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Fully booked</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Create circle modal */}
      <AnimatePresence>
        {showCreateCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateCircle(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create Food Circle</h2>
                <button onClick={() => setShowCreateCircle(false)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <input
                  placeholder="Circle name (e.g. Surulere Foodies)"
                  value={circleForm.name}
                  onChange={(e) => setCircleForm({ ...circleForm, name: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
                <input
                  placeholder="Neighborhood"
                  value={circleForm.neighborhood}
                  onChange={(e) => setCircleForm({ ...circleForm, neighborhood: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={circleForm.city}
                    onChange={(e) => setCircleForm({ ...circleForm, city: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                  <input
                    placeholder="State"
                    value={circleForm.state}
                    onChange={(e) => setCircleForm({ ...circleForm, state: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCreateCircle}>
                  Create circle
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create group order modal */}
      <AnimatePresence>
        {showCreateGroupOrder && activeCircle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateGroupOrder(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Start Group Order</h2>
                <button onClick={() => setShowCreateGroupOrder(false)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Select vendor</label>
                  <select
                    value={groupOrderForm.vendorId}
                    onChange={(e) => {
                      const v = vendors.find((v) => v.id === e.target.value);
                      setGroupOrderForm({
                        ...groupOrderForm,
                        vendorId: e.target.value,
                        foodName: v?.menuItems[0]?.name || "",
                        cuisine: v?.specialties[0] || "",
                        pricePerServing: v?.menuItems[0] ? Number(v.menuItems[0].price) : 0,
                      });
                    }}
                    className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="">Choose a vendor...</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.kitchenName} — {[v.city, v.state].filter(Boolean).join(", ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Food name"
                    value={groupOrderForm.foodName}
                    onChange={(e) => setGroupOrderForm({ ...groupOrderForm, foodName: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                  <input
                    placeholder="Cuisine"
                    value={groupOrderForm.cuisine}
                    onChange={(e) => setGroupOrderForm({ ...groupOrderForm, cuisine: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Servings</label>
                    <input
                      type="number"
                      min={2}
                      value={groupOrderForm.targetServings}
                      onChange={(e) => setGroupOrderForm({ ...groupOrderForm, targetServings: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Price/serving</label>
                    <input
                      type="number"
                      min={0}
                      value={groupOrderForm.pricePerServing}
                      onChange={(e) => setGroupOrderForm({ ...groupOrderForm, pricePerServing: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Delivery fee</label>
                    <input
                      type="number"
                      min={0}
                      value={groupOrderForm.totalDeliveryFee}
                      onChange={(e) => setGroupOrderForm({ ...groupOrderForm, totalDeliveryFee: Number(e.target.value) })}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Delivery window</label>
                  <input
                    type="datetime-local"
                    value={groupOrderForm.deliveryWindow}
                    onChange={(e) => setGroupOrderForm({ ...groupOrderForm, deliveryWindow: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <input
                  placeholder="Delivery address"
                  value={groupOrderForm.deliveryAddress}
                  onChange={(e) => setGroupOrderForm({ ...groupOrderForm, deliveryAddress: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
                {groupOrderForm.targetServings > 0 && groupOrderForm.totalDeliveryFee > 0 && (
                  <p className="text-sm text-gray-500">
                    Delivery fee per serving: {symbol}{(groupOrderForm.totalDeliveryFee / groupOrderForm.targetServings).toFixed(0)}
                  </p>
                )}
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleCreateGroupOrder}>
                  Create group order
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
