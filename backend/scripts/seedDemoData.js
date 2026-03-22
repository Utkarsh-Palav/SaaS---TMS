/**
 * Bulk seed demo data for one organization (departments, employees, teams, tasks, rooms, meetings, chat channels).
 *
 * Usage (from backend folder):
 *   node scripts/seedDemoData.js
 *
 * Environment:
 *   MONGO_URI          - required (same as server)
 *   SEED_BOSS_EMAIL    - optional, default: reads from argv or below
 *   SEED_FORCE=1       - delete previous seed data for this org (see SEED_MARKER) and re-seed
 *   SEED_USER_PASSWORD - password for created demo users (default: SeedDemo@123)
 *   SEED_HISTORICAL_MONTHS - how many past calendar months get extra tasks (default: 5)
 *   SEED_HISTORICAL_TASKS_MIN / SEED_HISTORICAL_TASKS_MAX - per-month task count range (default: 5-12)
 *
 * Example:
 *   SEED_BOSS_EMAIL=you@example.com node scripts/seedDemoData.js
 *   SEED_FORCE=1 SEED_BOSS_EMAIL=you@example.com node scripts/seedDemoData.js   (Unix)
 *
 * Windows PowerShell (set env then run):
 *   $env:SEED_FORCE="1"; npm run seed:demo -- you@example.com
 * Or use the cross-platform shortcut:
 *   npm run seed:demo:force -- you@example.com
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Role from "../models/Role.model.js";
import Permission from "../models/Permission.model.js";
import Department from "../models/department.model.js";
import Team from "../models/team.model.js";
import Task from "../models/task.model.js";
import Room from "../models/room.model.js";
import Meeting from "../models/meeting.model.js";
import Channel from "../models/channelModel.js";

dotenv.config();

const SEED_MARKER = "__SEED_DEMO__";
const SEED_EMAIL_PREFIX = "taskify.seed.";

const defaultBossEmail =
  process.argv[2] || process.env.SEED_BOSS_EMAIL || "";

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursFromNow(h) {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d;
}

/** Random integer in [min, max] inclusive */
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Start/end of calendar month that is `monthsAgo` months before today */
function getMonthBounds(monthsAgo) {
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
  const label = `${anchor.toLocaleString("en-US", { month: "long" })} ${anchor.getFullYear()}`;
  return { start, end, label };
}

function randomDateInRange(start, end) {
  const a = start.getTime();
  const b = end.getTime();
  return new Date(a + Math.random() * (b - a));
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

const HISTORICAL_MONTHS_BACK = Math.min(
  24,
  Math.max(1, parseInt(process.env.SEED_HISTORICAL_MONTHS || "5", 10) || 5)
);
const HISTORICAL_TASKS_PER_MONTH_MIN = Math.min(
  50,
  Math.max(1, parseInt(process.env.SEED_HISTORICAL_TASKS_MIN || "5", 10) || 5)
);
const HISTORICAL_TASKS_PER_MONTH_MAX = Math.min(
  50,
  Math.max(
    HISTORICAL_TASKS_PER_MONTH_MIN,
    parseInt(process.env.SEED_HISTORICAL_TASKS_MAX || "12", 10) || 12
  )
);

const HISTORICAL_TASK_TITLE_PARTS = [
  "Backlog grooming",
  "Release checklist",
  "Documentation update",
  "Bug triage",
  "Client follow-up",
  "Sprint carry-over",
  "Security review",
  "Onboarding packet",
  "Budget checkpoint",
  "Vendor evaluation",
  "Training follow-up",
  "Metrics review",
  "API integration",
  "QA sign-off",
  "Stakeholder update",
];

/**
 * Past-month tasks with explicit createdAt/updatedAt for charts and reports.
 * Uses insertMany(..., { timestamps: false }) so Mongoose does not overwrite dates.
 */
async function seedHistoricalTasks(created, organizationId, bossId) {
  const deptCount = created.departments.length;
  if (!deptCount) return { count: 0 };

  const empByDept = created.departments.map((_, di) => {
    const start = di * 2;
    return created.employees.slice(start, start + 2);
  });

  const docs = [];

  for (let m = 1; m <= HISTORICAL_MONTHS_BACK; m++) {
    const { start: monthStart, end: monthEnd, label: monthLabel } = getMonthBounds(m);
    const nTasks = randomInt(
      HISTORICAL_TASKS_PER_MONTH_MIN,
      HISTORICAL_TASKS_PER_MONTH_MAX
    );

    for (let i = 0; i < nTasks; i++) {
      const di = i % deptCount;
      const dept = created.departments[di];
      const manager = created.managers[di];
      const team = created.teams[di];
      const emps = empByDept[di];
      if (!dept || !manager || !team || !emps.length) continue;

      const createdAt = randomDateInRange(monthStart, monthEnd);
      const now = new Date();
      let updatedAt = addDays(createdAt, randomInt(0, 14));
      if (updatedAt > now) updatedAt = new Date(now);
      if (updatedAt < createdAt) updatedAt = new Date(createdAt);

      let deadline = addDays(createdAt, randomInt(3, 35));
      const roll = Math.random();
      let status;
      if (roll < 0.72) status = "Completed";
      else if (roll < 0.88) status = "Overdue";
      else if (roll < 0.94) status = "In Progress";
      else status = "Pending";

      if (status === "Completed" || status === "Overdue") {
        if (deadline > now) deadline = addDays(now, -randomInt(1, 10));
        if (deadline <= createdAt) deadline = addDays(createdAt, randomInt(2, 14));
      }

      const titlePart =
        HISTORICAL_TASK_TITLE_PARTS[
          (i + m * 7) % HISTORICAL_TASK_TITLE_PARTS.length
        ];
      const title = `${created.departments[di].name.replace(" (Seed Demo)", "")}: ${titlePart} (${monthLabel})`;

      const milestones =
        status === "Completed"
          ? [
              { title: "Started", completed: true },
              { title: "Review", completed: true },
              { title: "Done", completed: true },
            ]
          : [
              { title: "Started", completed: true },
              { title: "Review", completed: false },
            ];

      docs.push({
        title,
        description: `${SEED_MARKER} Historical demo task for ${monthLabel} (seeded with backdated createdAt).`,
        department: dept._id,
        createdBy: bossId,
        assignedManager: manager._id,
        assignedEmployees: [emps[i % emps.length]._id],
        team: team._id,
        priority: ["Low", "Medium", "High"][i % 3],
        status,
        deadline,
        milestones,
        organizationId,
        createdAt,
        updatedAt,
      });
    }
  }

  if (docs.length === 0) return { count: 0 };

  const inserted = await Task.insertMany(docs, { timestamps: false });
  created.tasks.push(...inserted);

  const byDept = new Map();
  const byTeam = new Map();
  for (const doc of inserted) {
    const dId = String(doc.department);
    const tId = String(doc.team);
    if (!byDept.has(dId)) byDept.set(dId, []);
    if (!byTeam.has(tId)) byTeam.set(tId, []);
    byDept.get(dId).push(doc._id);
    byTeam.get(tId).push(doc._id);
  }

  for (const [deptId, taskIds] of byDept) {
    await Department.findByIdAndUpdate(deptId, {
      $push: { task: { $each: taskIds } },
    });
  }
  for (const [teamId, taskIds] of byTeam) {
    await Team.findByIdAndUpdate(teamId, {
      $push: { tasks: { $each: taskIds } },
    });
  }

  return { count: inserted.length };
}

async function clearPreviousSeed(organizationId) {
  const orgOid = new mongoose.Types.ObjectId(organizationId);

  const seedUsers = await User.find({
    organizationId: orgOid,
    email: { $regex: new RegExp(`^${SEED_EMAIL_PREFIX.replace(/\./g, "\\.")}`) },
  }).select("_id");
  const seedUserIds = seedUsers.map((u) => u._id);

  await Meeting.deleteMany({
    organizationId: orgOid,
    description: { $regex: SEED_MARKER },
  });
  await Task.deleteMany({
    organizationId: orgOid,
    description: { $regex: SEED_MARKER },
  });
  await Team.deleteMany({
    organizationId: orgOid,
    name: { $regex: SEED_MARKER },
  });

  if (seedUserIds.length) {
    await Channel.deleteMany({
      organizationId: orgOid,
      participants: { $in: seedUserIds },
    });
  }

  await User.deleteMany({
    organizationId: orgOid,
    email: { $regex: new RegExp(`^${SEED_EMAIL_PREFIX.replace(/\./g, "\\.")}`) },
  });

  await Room.deleteMany({
    organizationId: orgOid,
    name: { $regex: SEED_MARKER },
  });

  await Department.deleteMany({
    organizationId: orgOid,
    $or: [
      { description: { $regex: SEED_MARKER } },
      { name: { $regex: /\(Seed Demo\)$/ } },
    ],
  });

  console.log("Cleared previous seed data for this organization.");
}

/**
 * Manager / Employee roles are required for org workflows. Create them with
 * the same permission set as stored in DB (if missing). Run `npm run seed:permissions` first.
 */
async function ensureManagerAndEmployeeRoles() {
  let managerRole = await Role.findOne({ name: "Manager" });
  let employeeRole = await Role.findOne({ name: "Employee" });

  const allPermIds = (await Permission.find({}).select("_id")).map((p) => p._id);
  if (allPermIds.length === 0) {
    console.error(
      "No permissions in database. Run: npm run seed:permissions"
    );
    process.exit(1);
  }

  if (!managerRole) {
    managerRole = await Role.create({
      name: "Manager",
      permissions: allPermIds,
    });
    console.log("Created role: Manager (with all current permissions).");
  }
  if (!employeeRole) {
    employeeRole = await Role.create({
      name: "Employee",
      permissions: allPermIds,
    });
    console.log("Created role: Employee (with all current permissions).");
  }

  return { managerRole, employeeRole };
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  if (!defaultBossEmail) {
    console.error(
      "Set SEED_BOSS_EMAIL or pass boss email as first argument:\n" +
        "  node scripts/seedDemoData.js your-boss@email.com"
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const boss = await User.findOne({
    email: String(defaultBossEmail).trim().toLowerCase(),
  }).populate("role");

  if (!boss) {
    console.error(`No user found with email: ${defaultBossEmail}`);
    process.exit(1);
  }

  const organizationId = boss.organizationId;
  const bossId = boss._id;

  const { managerRole, employeeRole } = await ensureManagerAndEmployeeRoles();

  const seedPwd =
    process.env.SEED_USER_PASSWORD || "SeedDemo@123";
  const hashed = await bcrypt.hash(seedPwd, 10);

  if (process.env.SEED_FORCE === "1") {
    await clearPreviousSeed(organizationId);
  } else {
    const existing = await Department.findOne({
      organizationId,
      $or: [
        { description: { $regex: SEED_MARKER } },
        { name: { $regex: /\(Seed Demo\)$/ } },
      ],
    });
    if (existing) {
      console.log(
        "Seed data already exists for this org. Set SEED_FORCE=1 to remove and re-seed."
      );
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  const deptSpecs = [
    {
      name: "Engineering",
      budget: 500000,
      manager: { first: "Aarav", mid: "Kumar", last: "Sharma", job: "Engineering Manager" },
      employees: [
        { first: "Priya", mid: "Devi", last: "Nair", job: "Senior Developer" },
        { first: "Rohan", mid: "V", last: "Iyer", job: "Developer" },
      ],
    },
    {
      name: "Sales",
      budget: 200000,
      manager: { first: "Neha", mid: "R", last: "Patel", job: "Sales Manager" },
      employees: [
        { first: "Vikram", mid: "S", last: "Singh", job: "Account Executive" },
        { first: "Ananya", mid: "K", last: "Reddy", job: "SDR" },
      ],
    },
    {
      name: "Human Resources",
      budget: 120000,
      manager: { first: "Kavita", mid: "M", last: "Desai", job: "HR Manager" },
      employees: [
        { first: "Suresh", mid: "T", last: "Menon", job: "HR Specialist" },
        { first: "Divya", mid: "L", last: "Pillai", job: "Recruiter" },
      ],
    },
  ];

  const created = {
    departments: [],
    managers: [],
    employees: [],
    teams: [],
    tasks: [],
    rooms: [],
    meetings: [],
    channels: [],
  };

  let emailCounter = 1;
  const nextEmail = () => {
    const e = `${SEED_EMAIL_PREFIX}u${emailCounter}@example.com`;
    emailCounter++;
    return e;
  };

  for (const spec of deptSpecs) {
    const dept = await Department.create({
      name: `${spec.name} (Seed Demo)`,
      description: `${SEED_MARKER} Auto-generated demo department for ${spec.name}.`,
      budget: spec.budget,
      organizationId,
    });
    created.departments.push(dept);

    const mgrEmail = nextEmail();
    const manager = await User.create({
      firstName: spec.manager.first,
      middleName: spec.manager.mid,
      lastName: spec.manager.last,
      email: mgrEmail,
      contactNo: `9${String(100000000 + emailCounter).slice(0, 9)}`,
      password: hashed,
      role: managerRole._id,
      jobTitle: spec.manager.job,
      departmentId: dept._id,
      organizationId,
      status: "Active",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      bio: `${SEED_MARKER} Demo manager account.`,
    });
    created.managers.push(manager);

    await Department.findByIdAndUpdate(dept._id, { manager: manager._id });

    const empDocs = [];
    for (const emp of spec.employees) {
      const empEmail = nextEmail();
      const u = await User.create({
        firstName: emp.first,
        middleName: emp.mid,
        lastName: emp.last,
        email: empEmail,
        contactNo: `9${String(100000000 + emailCounter).slice(0, 9)}`,
        password: hashed,
        role: employeeRole._id,
        jobTitle: emp.job,
        departmentId: dept._id,
        organizationId,
        status: "Active",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        bio: `${SEED_MARKER} Demo employee.`,
      });
      empDocs.push(u);
      created.employees.push(u);
    }

    const team = await Team.create({
      name: `${spec.name} Squad ${SEED_MARKER}`,
      departmentId: dept._id,
      organizationId,
      members: [manager._id, ...empDocs.map((e) => e._id)],
      tasks: [],
    });
    created.teams.push(team);

    await Department.findByIdAndUpdate(dept._id, { $push: { teams: team._id } });

    const t1 = await Task.create({
      title: `${spec.name}: Q1 planning`,
      description: `${SEED_MARKER} Align roadmap and milestones for the quarter.`,
      department: dept._id,
      createdBy: bossId,
      assignedManager: manager._id,
      assignedEmployees: [empDocs[0]._id],
      team: team._id,
      priority: "High",
      status: "In Progress",
      deadline: daysFromNow(14),
      milestones: [
        { title: "Draft plan", completed: true },
        { title: "Stakeholder review", completed: false },
      ],
      organizationId,
    });
    const t2 = await Task.create({
      title: `${spec.name}: Weekly sync follow-ups`,
      description: `${SEED_MARKER} Track action items from last sync.`,
      department: dept._id,
      createdBy: bossId,
      assignedManager: manager._id,
      assignedEmployees: empDocs.map((e) => e._id),
      team: team._id,
      priority: "Medium",
      status: "Pending",
      deadline: daysFromNow(7),
      milestones: [{ title: "Send summary", completed: false }],
      organizationId,
    });
    created.tasks.push(t1, t2);

    await Department.findByIdAndUpdate(dept._id, {
      $push: { task: { $each: [t1._id, t2._id] } },
    });

    await Team.findByIdAndUpdate(team._id, {
      $push: { tasks: { $each: [t1._id, t2._id] } },
    });
  }

  const historical = await seedHistoricalTasks(created, organizationId, bossId);
  console.log(
    `Seeded ${historical.count} historical tasks (${HISTORICAL_MONTHS_BACK} months × ${HISTORICAL_TASKS_PER_MONTH_MIN}-${HISTORICAL_TASKS_PER_MONTH_MAX} each).`
  );

  const roomSpecs = [
    { name: `Boardroom A ${SEED_MARKER}`, capacity: 12, floor: "3", amenities: ["Projector", "VC"] },
    { name: `Huddle 2 ${SEED_MARKER}`, capacity: 6, floor: "2", amenities: ["Whiteboard"] },
    { name: `Town Hall ${SEED_MARKER}`, capacity: 40, floor: "1", amenities: ["PA", "Stage"] },
  ];

  for (const r of roomSpecs) {
    const room = await Room.create({
      organizationId,
      name: r.name,
      capacity: r.capacity,
      floor: r.floor,
      amenities: r.amenities,
      isActive: true,
    });
    created.rooms.push(room);
  }

  const [roomA, roomB] = created.rooms;

  const m1 = created.managers[0];
  const e1 = created.employees[0];

  const start1 = hoursFromNow(24);
  const end1 = new Date(start1.getTime() + 60 * 60 * 1000);
  const meet1 = await Meeting.create({
    organizationId,
    title: `Product review ${SEED_MARKER}`,
    description: `${SEED_MARKER} Walkthrough of roadmap.`,
    host: bossId,
    participants: [m1._id, e1._id],
    meetingType: "In-Person",
    roomId: roomA._id,
    virtualLink: null,
    date: start1,
    startTime: start1,
    endTime: end1,
    status: "Scheduled",
  });
  created.meetings.push(meet1);

  const start2 = hoursFromNow(48);
  const end2 = new Date(start2.getTime() + 90 * 60 * 1000);
  const meet2 = await Meeting.create({
    organizationId,
    title: `Sales pipeline ${SEED_MARKER}`,
    description: `${SEED_MARKER} Forecast and deals discussion.`,
    host: bossId,
    participants: [created.managers[1]._id],
    meetingType: "Virtual",
    roomId: null,
    virtualLink: "https://meet.example.com/demo-seed",
    date: start2,
    startTime: start2,
    endTime: end2,
    status: "Scheduled",
  });
  created.meetings.push(meet2);

  const start3 = hoursFromNow(72);
  const end3 = new Date(start3.getTime() + 60 * 60 * 1000);
  const meet3 = await Meeting.create({
    organizationId,
    title: `HR policy sync ${SEED_MARKER}`,
    description: `${SEED_MARKER} Hybrid session.`,
    host: bossId,
    participants: [created.managers[2]._id, created.employees[4]._id],
    meetingType: "Hybrid",
    roomId: roomB._id,
    virtualLink: "https://meet.example.com/demo-hybrid",
    date: start3,
    startTime: start3,
    endTime: end3,
    status: "Scheduled",
  });
  created.meetings.push(meet3);

  const dm = await Channel.create({
    isGroupChat: false,
    participants: [bossId, e1._id],
    organizationId,
  });
  created.channels.push(dm);

  console.log("\n--- Seed complete ---");
  console.log(`Organization: ${organizationId}`);
  console.log(`Boss (unchanged): ${boss.email}`);
  console.log(`Demo user login password (all ${SEED_EMAIL_PREFIX}*@example.com): ${seedPwd}`);
  console.log(`Departments: ${created.departments.length}`);
  console.log(`Managers: ${created.managers.length}`);
  console.log(`Employees: ${created.employees.length}`);
  console.log(`Teams: ${created.teams.length}`);
  console.log(`Tasks (total): ${created.tasks.length}`);
  console.log(`Rooms: ${created.rooms.length}`);
  console.log(`Meetings: ${created.meetings.length}`);
  console.log(`DM channels: ${created.channels.length}`);
  console.log(
    "\nTip: Log in as boss to see everything. Demo users use emails like taskify.seed.u1@example.com"
  );

  await mongoose.disconnect();
  console.log("Disconnected.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
