import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCircle,
  listCircles,
  joinCircle,
  leaveCircle,
  createGroupOrder,
  listGroupOrders,
  joinGroupOrder,
  getCircleDetails,
} from "../services/foodCircleService";

type AuthRequest = Request & { user?: { id: string; role: string } };

/**
 * POST /api/circles
 */
export const createCircleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const { name, neighborhood, city, state, lat, lng, radiusKm } = req.body;
  if (!name || !neighborhood || !city || !state) {
    res.status(400).json({ success: false, error: { message: "Name, neighborhood, city, and state are required" } });
    return;
  }

  const circle = await createCircle({ name, neighborhood, city, state, lat, lng, radiusKm, creatorId: userId });
  res.status(201).json({ success: true, data: circle });
});

/**
 * GET /api/circles
 */
export const listCirclesHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const circles = await listCircles(userId);
  res.json({ success: true, data: circles });
});

/**
 * GET /api/circles/:id
 */
export const getCircleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  try {
    const circle = await getCircleDetails(req.params.id, userId);
    res.json({ success: true, data: circle });
  } catch (err: any) {
    res.status(404).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/circles/:id/join
 */
export const joinCircleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  try {
    const member = await joinCircle(req.params.id, userId, req.body.vendorProfileId);
    res.status(201).json({ success: true, data: member });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

/**
 * DELETE /api/circles/:id/leave
 */
export const leaveCircleHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  try {
    await leaveCircle(req.params.id, userId);
    res.json({ success: true, message: "Left circle" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/circles/:id/group-orders
 */
export const createGroupOrderHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const {
    vendorId,
    menuItemId,
    foodName,
    cuisine,
    targetServings,
    pricePerServing,
    totalDeliveryFee,
    deliveryWindow,
    deliveryAddress,
  } = req.body;

  if (!vendorId || !foodName || !cuisine || !targetServings || !pricePerServing || !deliveryWindow || !deliveryAddress) {
    res.status(400).json({ success: false, error: { message: "Missing required fields" } });
    return;
  }

  try {
    const groupOrder = await createGroupOrder({
      circleId: req.params.id,
      creatorId: userId,
      vendorId,
      menuItemId,
      foodName,
      cuisine,
      targetServings,
      pricePerServing,
      totalDeliveryFee,
      deliveryWindow,
      deliveryAddress,
    });
    res.status(201).json({ success: true, data: groupOrder });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/circles/:id/group-orders
 */
export const listGroupOrdersHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const groupOrders = await listGroupOrders(req.params.id);
  res.json({ success: true, data: groupOrders });
});

/**
 * POST /api/group-orders/:id/join
 */
export const joinGroupOrderHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const { servings } = req.body;
  if (!servings || servings < 1) {
    res.status(400).json({ success: false, error: { message: "Servings must be at least 1" } });
    return;
  }

  try {
    const result = await joinGroupOrder(req.params.id, userId, servings);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
});
