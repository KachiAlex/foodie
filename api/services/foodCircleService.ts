import { prisma } from "../lib/prisma";

/**
 * Creates a new food circle for a neighborhood.
 */
export async function createCircle(data: {
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  creatorId: string;
}) {
  const circle = await prisma.foodCircle.create({
    data: {
      name: data.name,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      lat: data.lat,
      lng: data.lng,
      radiusKm: data.radiusKm ?? 5,
      members: {
        create: {
          userId: data.creatorId,
          role: "admin",
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  return circle;
}

/**
 * Lists circles near a given location or all circles for a user.
 */
export async function listCircles(userId: string) {
  const circles = await prisma.foodCircle.findMany({
    include: {
      members: {
        select: { userId: true, role: true },
      },
      _count: {
        select: { members: true, groupOrders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return circles.map((c) => ({
    ...c,
    isMember: c.members.some((m) => m.userId === userId),
  }));
}

/**
 * Joins a circle.
 */
export async function joinCircle(circleId: string, userId: string, vendorProfileId?: string) {
  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId } },
  });

  if (existing) {
    throw new Error("Already a member of this circle");
  }

  return prisma.circleMember.create({
    data: { circleId, userId, vendorProfileId },
  });
}

/**
 * Leaves a circle.
 */
export async function leaveCircle(circleId: string, userId: string) {
  return prisma.circleMember.delete({
    where: { circleId_userId: { circleId, userId } },
  });
}

/**
 * Creates a group order within a circle.
 */
export async function createGroupOrder(data: {
  circleId: string;
  creatorId: string;
  vendorId: string;
  menuItemId?: string;
  foodName: string;
  cuisine: string;
  targetServings: number;
  pricePerServing: number;
  totalDeliveryFee: number;
  deliveryWindow: string;
  deliveryAddress: string;
}) {
  const deliveryFeePerServing = data.totalDeliveryFee / data.targetServings;

  const groupOrder = await prisma.groupOrder.create({
    data: {
      circleId: data.circleId,
      creatorId: data.creatorId,
      vendorId: data.vendorId,
      menuItemId: data.menuItemId,
      foodName: data.foodName,
      cuisine: data.cuisine,
      targetServings: data.targetServings,
      pricePerServing: data.pricePerServing,
      totalDeliveryFee: data.totalDeliveryFee,
      deliveryFeePerServing: Math.round(deliveryFeePerServing * 100) / 100,
      deliveryWindow: new Date(data.deliveryWindow),
      deliveryAddress: data.deliveryAddress,
    },
    include: {
      vendor: { select: { id: true, kitchenName: true } },
      creator: { select: { id: true, name: true } },
      slots: true,
    },
  });

  return groupOrder;
}

/**
 * Lists active group orders in a circle.
 */
export async function listGroupOrders(circleId: string) {
  return prisma.groupOrder.findMany({
    where: {
      circleId,
      status: { in: ["open", "full"] },
    },
    include: {
      vendor: { select: { id: true, kitchenName: true, specialties: true } },
      creator: { select: { id: true, name: true } },
      slots: {
        include: { buyer: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Joins a group order by reserving servings.
 */
export async function joinGroupOrder(
  groupOrderId: string,
  buyerId: string,
  servings: number
) {
  const groupOrder = await prisma.groupOrder.findUnique({
    where: { id: groupOrderId },
    include: { slots: true },
  });

  if (!groupOrder) {
    throw new Error("Group order not found");
  }

  if (groupOrder.status !== "open") {
    throw new Error("This group order is no longer accepting slots");
  }

  const remaining = groupOrder.targetServings - groupOrder.filledServings;
  if (servings > remaining) {
    throw new Error(`Only ${remaining} servings remaining`);
  }

  const amountPaid = Number(groupOrder.pricePerServing) * servings +
    Number(groupOrder.deliveryFeePerServing) * servings;

  const slot = await prisma.groupOrderSlot.create({
    data: {
      groupOrderId,
      buyerId,
      servings,
      amountPaid,
    },
  });

  // Update filled servings
  const newFilled = groupOrder.filledServings + servings;
  await prisma.groupOrder.update({
    where: { id: groupOrderId },
    data: {
      filledServings: newFilled,
      status: newFilled >= groupOrder.targetServings ? "full" : "open",
    },
  });

  return { slot, amountPaid };
}

/**
 * Gets circle details with members and active group orders.
 */
export async function getCircleDetails(circleId: string, userId: string) {
  const circle = await prisma.foodCircle.findUnique({
    where: { id: circleId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true } },
          vendorProfile: { select: { id: true, kitchenName: true, specialties: true } },
        },
      },
      groupOrders: {
        where: { status: { in: ["open", "full"] } },
        include: {
          vendor: { select: { id: true, kitchenName: true } },
          creator: { select: { id: true, name: true } },
          slots: { include: { buyer: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!circle) {
    throw new Error("Circle not found");
  }

  return {
    ...circle,
    isMember: circle.members.some((m) => m.userId === userId),
  };
}
