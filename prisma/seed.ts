import bcrypt from "bcryptjs";
import { PrismaClient, PageStatus } from "@prisma/client";

const db = new PrismaClient();

const introductions: Record<string, string> = {
  Walking: "<p>Walking is one of the body’s most repeated movements. Small choices in pace, posture, footwear, and terrain can compound across thousands of steps.</p>",
  "Weight Lifting": "<p>Resistance gives the body a reason to adapt. Understanding position, load, and recovery helps make that adaptation useful and sustainable.</p>",
  Sitting: "<p>Sitting is not inherently harmful. The bigger question is how long you remain still, what positions you repeat, and what movement surrounds that time.</p>",
  Stretching: "<p>Stretching changes sensation, tolerance, and sometimes range of motion. The effect depends on why, when, and how you do it.</p>",
  Eating: "<p>Food affects energy, digestion, recovery, and long-term health. The patterns around eating often matter more than any single ingredient.</p>",
  Sleeping: "<p>Sleep is active maintenance. It shapes memory, appetite, immune function, tissue recovery, and how effort feels the following day.</p>",
};

async function createPage(
  title: string,
  displayOrder: number,
  parentId: string | null = null,
  content = "",
) {
  return db.page.create({
    data: {
      title,
      slug: title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      parentId,
      displayOrder,
      content: content || introductions[title] || `<p>An introduction to ${title.toLowerCase()} and what it means for your body.</p>`,
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

  if (await db.page.count()) return;

  const walking = await createPage("Walking", 0);
  await createPage("Walking Posture", 0, walking.id, "<h2>Posture is movement, not a pose</h2><p>There is no single perfect shape to hold all day. A useful walking posture lets the head, ribcage, pelvis, and feet share motion without unnecessary effort.</p><blockquote>Comfort often comes from having more positions available, not from finding one correct position.</blockquote><h2>What to notice</h2><ul><li>Whether your gaze stays comfortably ahead</li><li>Whether your arms swing without being forced</li><li>Whether your breath remains easy as pace increases</li></ul>");
  await createPage("Foot Strike", 1, walking.id);

  const lifting = await createPage("Weight Lifting", 1);
  const chest = await createPage("Chest", 0, lifting.id);
  const fundamentals = await createPage("Fundamentals", 0, chest.id);
  await createPage("Anatomy", 0, fundamentals.id);
  await createPage("Function", 1, fundamentals.id);
  const exercises = await createPage("Exercises", 1, chest.id);
  await createPage("Incline Press", 0, exercises.id);
  await createPage("Flat Press", 1, exercises.id);
  await createPage("Pushups", 2, exercises.id);

  await createPage("Sitting", 2);
  await createPage("Stretching", 3);
  await createPage("Eating", 4);
  await createPage("Sleeping", 5);
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
