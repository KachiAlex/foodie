import dotenv from "dotenv";
dotenv.config();

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = neon(process.env.DATABASE_URL);

const TARGET_EMAIL = "opd.livmind@gmail.com";
const DEMO_PASSWORD = "demo123";

const IMAGES = {
  jollof: "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=900&q=80&auto=format&fit=crop",
  jollof2: "https://images.unsplash.com/photo-1664992960082-0ea299a9c53e?w=900&q=80&auto=format&fit=crop",
  egusi: "https://images.unsplash.com/photo-1763048443535-1243379234e2?w=900&q=80&auto=format&fit=crop",
  poundedYam: "https://upload.wikimedia.org/wikipedia/commons/8/81/Pounded_Yam_and_Egusi_Soup.jpg",
  egusiPlates: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Plates_of_Egusi_Soup_with_vegetables_and_wrapped_Pounded_Yam.jpg",
  suya: "https://images.unsplash.com/photo-1777502286534-5479ccaacfd7?w=900&q=80&auto=format&fit=crop",
  puffPuff: "https://images.unsplash.com/photo-1767324672458-7dec3a2acffa?w=900&q=80&auto=format&fit=crop",
  akara: "https://upload.wikimedia.org/wikipedia/commons/9/95/Akara_na_Akamu_%28Fried_Bean_cakes_and_Pap%29.jpg",
  moiMoi: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Sliced_Moi_Moi.jpg",
  dodo: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Dodo%28Fried_ripe_plantains%29_and_Chicken.jpg",
  amala: "https://upload.wikimedia.org/wikipedia/commons/8/86/Amala%2C_ewedu_and_assorted_meat.jpg",
  ofada: "https://upload.wikimedia.org/wikipedia/commons/0/05/Unpolished_local_rice_and_stew_%28_Nigerian_cuisine%29.jpg",
  zobo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Zobo_drink.jpg",
  chinChin: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Nigerian_ChinChin.jpg",
  pepperSoupCatfish: "https://commons.wikimedia.org/wiki/Special:FilePath/A_plate_catfish_peppersoup.jpg",
  pepperSoupGoat: "https://commons.wikimedia.org/wiki/Special:FilePath/Chevon_pepper_soup.jpg",
  bangaSoup: "https://commons.wikimedia.org/wiki/Special:FilePath/Banga_Soup.jpg",
  nativeSoup: "https://commons.wikimedia.org/wiki/Special:FilePath/A_rich_plate_of_Native_soup.jpg",
  bitterleafSoup: "https://commons.wikimedia.org/wiki/Special:FilePath/Bitterleaf_soup_(_Nigerian_cuisine).jpg",
  efoRiro: "https://commons.wikimedia.org/wiki/Special:FilePath/A_bowl_of_blended_tomato.jpg",
  amalaGbegiri: "https://commons.wikimedia.org/wiki/Special:FilePath/Amala_and_Gbegiri_with_Ewedu_soup.jpg",
  grilledPlatter: "https://images.unsplash.com/photo-1777502286534-5479ccaacfd7?w=900&q=80&auto=format&fit=crop",
  ricePlatter: "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=900&q=80&auto=format&fit=crop",
  smallChops: "https://images.unsplash.com/photo-1767324672458-7dec3a2acffa?w=900&q=80&auto=format&fit=crop",
};

interface SeedDish {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const TARGET_DISHES: SeedDish[] = [
  { name: "Classic Party Jollof", description: "Smoky Nigerian party jollof rice with fried plantain and grilled chicken.", price: 2800, category: "Rice", imageUrl: IMAGES.jollof },
  { name: "Nigerian Fried Rice", description: "Stir-fried rice with mixed vegetables, liver, and prawns.", price: 2600, category: "Rice", imageUrl: IMAGES.jollof2 },
  { name: "Ofada Rice & Ayamase", description: "Unpolished local Ofada rice served with spicy green-ofada stew.", price: 3200, category: "Rice", imageUrl: IMAGES.ofada },
  { name: "Pounded Yam & Egusi", description: "Smooth pounded yam with rich melon-seed egusi soup and assorted meats.", price: 2700, category: "Swallows", imageUrl: IMAGES.poundedYam },
  { name: "Amala & Ewedu", description: "Yam flour amala with drawy ewedu soup and pepper stew.", price: 2300, category: "Swallows", imageUrl: IMAGES.amala },
  { name: "Suya Spiced Beef", description: "Northern-style spicy grilled beef skewers with yaji spice.", price: 2200, category: "Protein", imageUrl: IMAGES.suya },
  { name: "Grilled Chicken Quarter", description: "Marinated chicken grilled over charcoal, served with pepper sauce.", price: 3500, category: "Protein", imageUrl: IMAGES.jollof2 },
  { name: "Akara (Bean Cakes)", description: "Crispy fried bean fritters — perfect for breakfast or snack.", price: 1500, category: "Snacks", imageUrl: IMAGES.akara },
  { name: "Puff Puff", description: "Soft, golden dough balls — a Nigerian party favourite.", price: 1000, category: "Snacks", imageUrl: IMAGES.puffPuff },
  { name: "Zobo Drink", description: "Chilled hibiscus drink with ginger and pineapple flavour.", price: 800, category: "Drinks", imageUrl: IMAGES.zobo },
];

const DEMO_VENDORS = [
  {
    email: "demo-vendor-ngozi@foodie.local",
    name: "Mama Ngozi",
    kitchenName: "Mama Ngozi's Kitchen",
    streetAddress: "12 Ojuelegba Road",
    city: "Lagos",
    state: "Lagos",
    landmark: "Ojuelegba Roundabout",
    specialties: ["Rice Dishes", "Grilled Proteins"],
    dishes: [
      { name: "Mama Ngozi Jollof", description: "Party-style jollof with smoky bottom-pot flavor.", price: 2500, category: "Rice", imageUrl: IMAGES.jollof },
      { name: "Fried Rice Special", description: "Loaded fried rice with chicken chunks and liver.", price: 2700, category: "Rice", imageUrl: IMAGES.jollof2 },
      { name: "Coconut Rice", description: "Fragrant coconut rice with peppers and smoked fish.", price: 2600, category: "Rice", imageUrl: IMAGES.ricePlatter },
      { name: "Ofada Rice Combo", description: "Ofada rice, egg, and spicy ofada stew.", price: 3000, category: "Rice", imageUrl: IMAGES.ofada },
      { name: "Suya Chicken Skewers", description: "Spiced chicken suya served with onions.", price: 2100, category: "Protein", imageUrl: IMAGES.suya },
      { name: "Suya Beef Skewers", description: "Northern-style spicy beef suya with yaji spice.", price: 2300, category: "Protein", imageUrl: IMAGES.suya },
      { name: "Grilled Turkey", description: "Charcoal-grilled turkey with pepper sauce.", price: 2800, category: "Protein", imageUrl: IMAGES.grilledPlatter },
      { name: "Moi Moi", description: "Steamed bean pudding with egg and smoked fish.", price: 1600, category: "Snacks", imageUrl: IMAGES.moiMoi },
      { name: "Puff Puff", description: "Soft, golden Nigerian dough balls.", price: 1100, category: "Snacks", imageUrl: IMAGES.puffPuff },
      { name: "Chilled Zobo", description: "Hibiscus drink with ginger and pineapple.", price: 900, category: "Drinks", imageUrl: IMAGES.zobo },
    ],
  },
  {
    email: "demo-vendor-amina@foodie.local",
    name: "Chef Amina",
    kitchenName: "Amina's Pot",
    streetAddress: "15 Ikoyi Crescent",
    city: "Lagos",
    state: "Lagos",
    landmark: "Falomo Bridge",
    specialties: ["Soups", "Swallows", "Snacks"],
    dishes: [
      { name: "Egusi Soup & Semo", description: "Thick egusi soup with semolina and beef.", price: 2900, category: "Soups", imageUrl: IMAGES.egusi },
      { name: "Pounded Yam Bowl", description: "Pounded yam with egusi and assorted meats.", price: 2800, category: "Swallows", imageUrl: IMAGES.poundedYam },
      { name: "Amala Gbegiri Ewedu", description: "Amala with gbegiri and ewedu combo.", price: 2500, category: "Swallows", imageUrl: IMAGES.amalaGbegiri },
      { name: "Ogbono Soup & Fufu", description: "Drawy ogbono soup with fufu and goat meat.", price: 3000, category: "Soups", imageUrl: IMAGES.egusiPlates },
      { name: "Afang Soup", description: "Nutritious afang soup with waterleaf and beef.", price: 3100, category: "Soups", imageUrl: IMAGES.nativeSoup },
      { name: "Efo Riro", description: "Spinach stew with peppers, locust beans, and assorted meat.", price: 2700, category: "Soups", imageUrl: IMAGES.efoRiro },
      { name: "Bitterleaf Soup", description: "Onugbu soup with assorted meat and fish.", price: 3200, category: "Soups", imageUrl: IMAGES.bitterleafSoup },
      { name: "Wheat Meal", description: "Wheat swallow served with efo riro.", price: 2000, category: "Swallows", imageUrl: IMAGES.amala },
      { name: "Banga Soup", description: "Palm kernel banga soup with fresh fish and starch.", price: 3300, category: "Soups", imageUrl: IMAGES.bangaSoup },
      { name: "Crunchy Chin Chin", description: "Sweet and crunchy fried pastry snack pack.", price: 1200, category: "Snacks", imageUrl: IMAGES.chinChin },
    ],
  },
  {
    email: "demo-vendor-kemi@foodie.local",
    name: "Iya Kemi",
    kitchenName: "Iya Kemi's Buka",
    streetAddress: "23 Yaba Market Street",
    city: "Lagos",
    state: "Lagos",
    landmark: "Yaba College Gate",
    specialties: ["Small Chops", "Street Food"],
    dishes: [
      { name: "Moi Moi Deluxe", description: "Steamed bean pudding with egg and fish.", price: 1800, category: "Snacks", imageUrl: IMAGES.moiMoi },
      { name: "Hot Akara", description: "Fresh bean cakes with pepper sauce.", price: 1400, category: "Snacks", imageUrl: IMAGES.akara },
      { name: "Puff Puff Tray", description: "A tray of warm puff puff for sharing.", price: 1300, category: "Snacks", imageUrl: IMAGES.puffPuff },
      { name: "Dodo & Chicken", description: "Fried ripe plantains with grilled chicken.", price: 2400, category: "Snacks", imageUrl: IMAGES.dodo },
      { name: "Gizzard & Dodo", description: "Spicy peppered gizzard with fried plantain.", price: 2600, category: "Snacks", imageUrl: IMAGES.dodo },
      { name: "Spring Rolls", description: "Crispy vegetable spring rolls with dipping sauce.", price: 1500, category: "Snacks", imageUrl: IMAGES.smallChops },
      { name: "Samosa", description: "Spiced meat samosa — a party favourite.", price: 1500, category: "Snacks", imageUrl: IMAGES.smallChops },
      { name: "Meat Pie", description: "Flaky pastry filled with seasoned minced beef.", price: 1200, category: "Snacks", imageUrl: IMAGES.smallChops },
      { name: "Fish Roll", description: "Crispy roll stuffed with spiced fish filling.", price: 1300, category: "Snacks", imageUrl: IMAGES.smallChops },
      { name: "Suya Gizzard", description: "Peppered gizzard skewers dusted with yaji.", price: 2000, category: "Snacks", imageUrl: IMAGES.suya },
    ],
  },
  {
    email: "demo-vendor-sule@foodie.local",
    name: "Baba Sule",
    kitchenName: "Baba Sule Grill",
    streetAddress: "8 Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    landmark: "Lekki Toll Gate",
    specialties: ["Pepper Soup", "Drinks", "Fish"],
    dishes: [
      { name: "Catfish Pepper Soup", description: "Hot and spicy point-and-kill catfish pepper soup.", price: 3500, category: "Soups", imageUrl: IMAGES.pepperSoupCatfish },
      { name: "Goat Meat Pepper Soup", description: "Spicy goat meat pepper soup with scent leaves.", price: 3200, category: "Soups", imageUrl: IMAGES.pepperSoupGoat },
      { name: "Grilled Croaker Fish", description: "Whole grilled croaker with yaji and pepper sauce.", price: 4500, category: "Protein", imageUrl: IMAGES.grilledPlatter },
      { name: "Grilled Tilapia", description: "Tilapia grilled with onions, peppers, and suya spice.", price: 4000, category: "Protein", imageUrl: IMAGES.suya },
      { name: "Suya Fish", description: "Spicy grilled fish suya with fresh pepper mix.", price: 2800, category: "Protein", imageUrl: IMAGES.suya },
      { name: "Asun", description: "Spicy smoked goat meat tossed in peppers and onions.", price: 3000, category: "Protein", imageUrl: IMAGES.grilledPlatter },
      { name: "Banga Soup", description: "Rich palm kernel soup with fresh fish.", price: 3400, category: "Soups", imageUrl: IMAGES.bangaSoup },
      { name: "Chapman", description: "Classic Nigerian Chapman cocktail mocktail.", price: 1200, category: "Drinks", imageUrl: IMAGES.zobo },
      { name: "Kunu", description: "Smooth millet and ginger drink.", price: 800, category: "Drinks", imageUrl: IMAGES.zobo },
      { name: "Tiger Nut Drink", description: "Creamy tiger nut milk with dates.", price: 1000, category: "Drinks", imageUrl: IMAGES.zobo },
    ],
  },
];

async function seedMenuItems(vendorId: string, dishes: SeedDish[]) {
  for (const dish of dishes) {
    await sql`
      INSERT INTO menu_items (id, "vendorId", name, description, price, category, "imageUrl", "isAvailable", "createdAt", "updatedAt")
      VALUES (
        ${randomUUID()}, ${vendorId}, ${dish.name}, ${dish.description}, ${dish.price}, ${dish.category}, ${dish.imageUrl}, ${true},
        NOW(), NOW()
      )
    `;
  }
}

async function createVendor(vendor: typeof DEMO_VENDORS[number]) {
  const userId = randomUUID();
  const profileId = randomUUID();
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  await sql`
    INSERT INTO users (id, email, name, "passwordHash", role, "verificationStatus", "createdAt", "updatedAt")
    VALUES (${userId}, ${vendor.email}, ${vendor.name}, ${passwordHash}, ${"vendor"}, ${"verified"}, NOW(), NOW())
  `;

  await sql`
    INSERT INTO vendor_profiles (
      id, "userId", "kitchenName", "streetAddress", city, state, landmark, specialties,
      rating, "totalOrders", "isOnline", verified, "createdAt", "updatedAt"
    )
    VALUES (
      ${profileId}, ${userId}, ${vendor.kitchenName}, ${vendor.streetAddress}, ${vendor.city}, ${vendor.state},
      ${vendor.landmark}, ${vendor.specialties}, ${4.5 + Math.random()}, ${Math.floor(Math.random() * 50)}, ${true}, ${true},
      NOW(), NOW()
    )
  `;

  await seedMenuItems(profileId, vendor.dishes);
  return { userId, profileId };
}

async function main() {
  // 1. Clean demo vendor data so re-runs don't duplicate
  const demoUsers = (await sql`
    SELECT id FROM users WHERE email LIKE ${"demo-vendor-%@foodie.local"}
  `) as { id: string }[];

  if (demoUsers.length > 0) {
    const demoIds = demoUsers.map((u) => u.id);
    await sql`DELETE FROM menu_items WHERE "vendorId" IN (SELECT id FROM vendor_profiles WHERE "userId" = ANY(${demoIds}))`;
    await sql`DELETE FROM vendor_profiles WHERE "userId" = ANY(${demoIds})`;
    await sql`DELETE FROM escrow_wallets WHERE "vendorId" = ANY(${demoIds})`;
    await sql`DELETE FROM notifications WHERE "userId" = ANY(${demoIds})`;
    await sql`DELETE FROM users WHERE id = ANY(${demoIds})`;
  }

  // 2. Ensure target user is a verified vendor with a profile
  const targetUser = (await sql`
    SELECT id FROM users WHERE email = ${TARGET_EMAIL}
  `) as { id: string }[];

  if (targetUser.length === 0) {
    throw new Error(`Target user ${TARGET_EMAIL} not found`);
  }
  const targetUserId = targetUser[0].id;

  await sql`UPDATE users SET role = ${"vendor"}, "verificationStatus" = ${"verified"}, "updatedAt" = NOW() WHERE id = ${targetUserId}`;

  let targetProfile = (await sql`
    SELECT id FROM vendor_profiles WHERE "userId" = ${targetUserId}
  `) as { id: string }[];

  if (targetProfile.length === 0) {
    const profileId = randomUUID();
    await sql`
      INSERT INTO vendor_profiles (
        id, "userId", "kitchenName", "streetAddress", city, state, landmark, specialties,
        rating, "totalOrders", "isOnline", verified, "createdAt", "updatedAt"
      )
      VALUES (
        ${profileId}, ${targetUserId}, ${"Onyedikachi Akoma Kitchen"}, ${"15 Surulere Street"}, ${"Lagos"}, ${"Lagos"},
        ${"National Stadium"}, ${["Rice", "Local Dishes", "Snacks"]}, ${4.8}, ${0}, ${true}, ${true},
        NOW(), NOW()
      )
    `;
    targetProfile = [{ id: profileId }];
  } else {
    await sql`UPDATE vendor_profiles SET verified = ${true}, "kitchenName" = ${"Onyedikachi Akoma Kitchen"}, specialties = ${["Rice", "Local Dishes", "Snacks"]}, "updatedAt" = NOW() WHERE id = ${targetProfile[0].id}`;
  }

  // 3. Clear and re-seed target user's dishes
  await sql`DELETE FROM menu_items WHERE "vendorId" = ${targetProfile[0].id}`;
  await seedMenuItems(targetProfile[0].id, TARGET_DISHES);

  // 4. Seed demo vendors + dishes
  for (const vendor of DEMO_VENDORS) {
    await createVendor(vendor);
  }

  console.log(`Seeded ${TARGET_DISHES.length} dishes for ${TARGET_EMAIL}`);
  console.log(`Seeded ${DEMO_VENDORS.length} demo vendors with ${DEMO_VENDORS.reduce((sum, v) => sum + v.dishes.length, 0)} dishes`);
}

main().catch((e) => { console.error(e); process.exit(1); });
