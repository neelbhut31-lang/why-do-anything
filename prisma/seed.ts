import bcrypt from "bcryptjs";
import { PrismaClient, PageStatus } from "@prisma/client";

const db = new PrismaClient();

const introductions: Record<string, string> = {
  Walking: `<h2>The Anatomy of Daily Movement</h2><p>Walking is one of the body’s most repeated movements. Small choices in pace, posture, footwear, and terrain compound across thousands of steps each day.</p><blockquote>Regular walking improves cardiovascular tone, joint lubrication, and lymphatic drainage without incurring high recovery demands.</blockquote><h2>Key Areas of Awareness</h2><ul><li><strong>Cadence & Pace:</strong> Natural stride frequency allows efficient ground reaction force transmission.</li><li><strong>Spinal Oscillations:</strong> The ribcage and pelvis counter-rotate naturally when arm swing is unconstrained.</li><li><strong>Ground Interaction:</strong> How the foot touches and pushes off shapes tension up the kinetic chain.</li></ul>`,
  "Weight Lifting": `<h2>Resistance & Adaptive Strain</h2><p>Resistance gives the body a reason to adapt. Understanding position, load, and recovery helps make that adaptation useful, symmetrical, and sustainable.</p><blockquote>Muscles adapt to mechanical tension, while tendons and bone density respond to progressive, repetitive stress over time.</blockquote><h2>Core Principles</h2><ul><li><strong>Mechanical Tension:</strong> Moving load through full, controlled ranges of motion.</li><li><strong>Progressive Overload:</strong> Gradually increasing difficulty, volume, or control.</li><li><strong>Recovery Cycles:</strong> Growth happens during rest, backed by adequate nutrition and sleep.</li></ul>`,
  Sitting: `<h2>Static Posture & Movement Volume</h2><p>Sitting is not inherently harmful. The main factor is duration—how long you remain motionless, what positions you repeat, and how much movement surrounds that time.</p><blockquote>Comfort often comes from having more movement options available throughout the day, rather than maintaining one rigid position.</blockquote><h2>What to Keep in Mind</h2><ul><li><strong>Frequent Re-positioning:</strong> Shifting weight periodically relieves constant pressure on specific spinal discs.</li><li><strong>Hip Flexor Relaxation:</strong> Standing or walking periodically restores extended hip alignment.</li><li><strong>Diaphragmatic Freedom:</strong> Slouching compresses the abdomen, limiting deep breath capacity.</li></ul>`,
  Stretching: `<h2>Neuromuscular Adaptation & Range of Motion</h2><p>Stretching alters sensation, nervous system tolerance, and tissue compliance. Its effect depends on why, when, and how you apply it.</p><blockquote>Static stretching reduces neural muscle tone temporarily, making it ideal post-workout, while dynamic mobility prepares joints before activity.</blockquote><h2>Key Distinctions</h2><ul><li><strong>Dynamic Mobility:</strong> Controlled active movement through full ranges of motion prior to exercise.</li><li><strong>Static Stretching:</strong> Holding positions past tension to reset resting muscular length.</li><li><strong>Neuromuscular Safety:</strong> The brain restricts range of motion when it perceives instability or lack of strength.</li></ul>`,
  Eating: `<h2>Nourishing the Body</h2><p>Food governs daily energy, tissue repair, digestion, and long-term metabolic health. Consistent dietary patterns matter significantly more than any individual meal.</p><blockquote>Balanced macronutrients maintain steady blood glucose, sustained energy, and optimal protein synthesis.</blockquote><h2>Key Principles</h2><ul><li><strong>Protein Distribution:</strong> Consuming adequate protein across meals supports muscle maintenance and satiety.</li><li><strong>Micronutrient Density:</strong> Whole, nutrient-dense foods supply vitamins and minerals essential for cellular function.</li><li><strong>Circadian Alignment:</strong> Timing larger meals during active hours supports digestive rhythms and sleep quality.</li></ul>`,
  Sleeping: `<h2>Active Regeneration & Cellular Maintenance</h2><p>Sleep is active physiological maintenance. It regulates memory consolidation, hormone balance, immune function, and cellular repair.</p><blockquote>Deep sleep clears metabolic waste from the brain via the glymphatic system and repairs physical tissue.</blockquote><h2>Foundations of Good Sleep</h2><ul><li><strong>Circadian Lighting:</strong> Bright morning sunlight anchors melatonin production for the night ahead.</li><li><strong>Temperature Control:</strong> A cool bedroom environment signals the core body temperature to drop for deep sleep.</li><li><strong>Consistent Timing:</strong> Going to bed and waking up at consistent hours stabilizes internal body clocks.</li></ul>`,
};

async function ensurePage(
  title: string,
  displayOrder: number,
  parentId: string | null = null,
  content = "",
) {
  const slug = title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  const existing = await db.page.findFirst({
    where: { parentId, slug },
  });

  const pageContent = content || introductions[title] || `<p>An introduction to ${title.toLowerCase()} and what it means for your body.</p>`;

  if (existing) {
    return db.page.update({
      where: { id: existing.id },
      data: {
        title,
        status: PageStatus.PUBLISHED,
        displayOrder,
        content: pageContent,
      },
    });
  }

  return db.page.create({
    data: {
      title,
      slug,
      parentId,
      displayOrder,
      content: pageContent,
      status: PageStatus.PUBLISHED,
    },
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  await db.user.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 12) },
    create: { email, passwordHash: await bcrypt.hash(password, 12) },
  });

  // Clean up any duplicate top-level test pages (e.g. walking-2, sleep-7, etc.)
  const canonicalSlugs = ["walking", "weight-lifting", "sitting", "stretching", "eating", "sleeping"];
  
  // Delete non-canonical top-level pages
  const unwantedTopPages = await db.page.findMany({
    where: {
      parentId: null,
      slug: { notIn: canonicalSlugs },
    },
    select: { id: true },
  });

  if (unwantedTopPages.length > 0) {
    await db.page.deleteMany({
      where: { id: { in: unwantedTopPages.map((p) => p.id) } },
    });
  }

  // Create or update clean top-level pages and sub-pages
  const walking = await ensurePage("Walking", 0);
  await ensurePage(
    "Walking Posture",
    0,
    walking.id,
    `<h2>Posture is Movement, Not a Pose</h2><p>There is no single perfect shape to hold all day. A useful walking posture lets the head, ribcage, pelvis, and feet share motion without unnecessary effort.</p><blockquote>Comfort often comes from having more positions available, not from finding one correct rigid position.</blockquote><h2>What to Notice</h2><ul><li><strong>Eye Gaze:</strong> Keep your gaze comfortably ahead rather than looking straight down at the ground.</li><li><strong>Arm Swing:</strong> Allow arms to swing freely from the shoulders, counterbalancing leg movement.</li><li><strong>Breathing:</strong> Maintain relaxed diaphragmatic breathing as your walking pace increases.</li></ul>`
  );
  await ensurePage(
    "Foot Strike",
    1,
    walking.id,
    `<h2>Understanding Foot Dynamics</h2><p>How your foot contacts the ground affects stress distribution across ankles, knees, and hips. Neither heel strike nor midfoot landing is inherently wrong; velocity and terrain dictate optimal form.</p><blockquote>Allowing the toes to splay naturally helps absorb impact forces efficiently.</blockquote><h2>Key Aspects</h2><ul><li><strong>Cadence Alignment:</strong> Over-striding increases braking force at heel strike. Landing closer to your center of mass reduces joint strain.</li><li><strong>Footwear Impact:</strong> Flexible shoes with minimal heel elevation encourage natural arch engagement.</li></ul>`
  );

  const lifting = await ensurePage("Weight Lifting", 1);
  const chest = await ensurePage("Chest", 0, lifting.id, "<p>Chest movements involve horizontal adduction and shoulder stability, engaging the pectoralis major, minor, and anterior deltoids.</p>");
  const fundamentals = await ensurePage("Fundamentals", 0, chest.id);
  await ensurePage(
    "Anatomy",
    0,
    fundamentals.id,
    `<h2>Anatomy of the Pectoral Musculature</h2><p>The chest consists primarily of the pectoralis major (sternal and clavicular heads) and the underlying pectoralis minor.</p><ul><li><strong>Clavicular Head (Upper Chest):</strong> Targeted by incline pressing angles (15°–30°).</li><li><strong>Sternocostal Head (Lower/Mid Chest):</strong> Targeted by flat and decline pressing movements.</li></ul>`
  );
  await ensurePage("Function", 1, fundamentals.id, "<p>The main actions of the pectoralis major are horizontal adduction, internal rotation, and flexion of the humerus.</p>");
  
  const exercises = await ensurePage("Exercises", 1, chest.id);
  await ensurePage("Incline Press", 0, exercises.id, "<p>The incline dumbbell or barbell press emphasizes the upper clavicular head of the chest while stabilizing the scapulae.</p>");
  await ensurePage("Flat Press", 1, exercises.id, "<p>The flat bench press allows maximum load recruitment across the sternal fibers of the pectoralis major.</p>");
  await ensurePage("Pushups", 2, exercises.id, "<p>Pushups provide closed-kinetic-chain tension, allowing natural movement of the scapulae without fixed bench support.</p>");

  await ensurePage(
    "Sitting",
    2,
    null,
    `<h2>Physiology of Prolonged Sitting</h2><p>Sitting is a comfortable, low-energy posture. The issue arises when remaining stationary for hours, reducing blood velocity and metabolic rate.</p><blockquote>Taking 2-minute movement breaks every 45 minutes completely alters the metabolic impact of desk work.</blockquote><h2>Simple Practices</h2><ul><li>Change sitting positions frequently.</li><li>Stand up during phone calls or quick breaks.</li><li>Perform gentle hip extensions to relieve hip flexor tightness.</li></ul>`
  );

  await ensurePage(
    "Stretching",
    3,
    null,
    `<h2>The Science of Flexibility</h2><p>Stretching increases range of motion by improving nervous system tolerance and reducing muscular resistance to elongation.</p><h2>When to Use Each Style</h2><ul><li><strong>Dynamic Warmups:</strong> Perform prior to activity to lubricate joints and elevate core body temperature.</li><li><strong>Static Stretching:</strong> Perform after activity when muscles are warm to foster relaxation and downregulate the nervous system.</li></ul>`
  );

  await ensurePage(
    "Eating",
    4,
    null,
    `<h2>Nourishing the Body</h2><p>Nutrition provides the building blocks for muscular repair, daily energy, and metabolic balance. Focus on consistent, whole-food nourishment.</p><h2>Key Pillars</h2><ul><li><strong>Protein:</strong> Essential for tissue repair, enzymes, and muscle retention.</li><li><strong>Complex Carbohydrates:</strong> Provide steady glucose for physical performance and brain function.</li><li><strong>Healthy Fats:</strong> Crucial for hormone synthesis and cellular membrane structure.</li></ul>`
  );

  await ensurePage(
    "Sleeping",
    5,
    null,
    `<h2>The Master Pillar of Health</h2><p>Sleep is the foundation upon which recovery, cognitive performance, and emotional balance rest. Quality sleep optimizes hormone secretion and brain waste clearance.</p><h2>Optimizing Sleep Quality</h2><ul><li><strong>Light Exposure:</strong> View morning sunlight within 30 minutes of waking; dim lights 1–2 hours before sleep.</li><li><strong>Temperature:</strong> Keep your room cool (around 65°F / 18°C) for ideal slow-wave sleep.</li><li><strong>Caffeine Cutoff:</strong> Avoid caffeine 8–10 hours before bedtime due to its long half-life.</li></ul>`
  );

  // Upload clean snapshot to Supabase Storage if configured
  try {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceRoleKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const pages = await db.page.findMany({
        where: { status: PageStatus.PUBLISHED },
        orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
      });
      await supabase.storage
        .from("media")
        .upload("published-pages.json", Buffer.from(JSON.stringify(pages)), {
          contentType: "application/json",
          upsert: true,
        });
      console.log("Successfully uploaded updated published-pages.json snapshot.");
    }
  } catch (err) {
    console.warn("Could not upload snapshot during seed:", err);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });

