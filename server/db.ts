// import { eq, desc } from "drizzle-orm";
// import { drizzle } from "drizzle-orm/mysql2";
// import { InsertUser, InsertSubmission, InsertUniversity, InsertSpecialization, users, universities, specializations, submissions, files } from "../drizzle/schema";
// import { ENV } from './_core/env';

// let _db: ReturnType<typeof drizzle> | null = null;

// // Lazily create the drizzle instance so local tooling can run without a DB.
// export async function getDb() {
//   if (!_db && process.env.DATABASE_URL) {
//     try {
//       _db = drizzle(process.env.DATABASE_URL);
//     } catch (error) {
//       console.warn("[Database] Failed to connect:", error);
//       _db = null;
//     }
//   }
//   return _db;
// }

// export async function upsertUser(user: InsertUser): Promise<void> {
//   if (!user.openId) {
//     throw new Error("User openId is required for upsert");
//   }

//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot upsert user: database not available");
//     return;
//   }

//   try {
//     const values: InsertUser = {
//       openId: user.openId,
//     };
//     const updateSet: Record<string, unknown> = {};

//     const textFields = ["name", "email", "loginMethod"] as const;
//     type TextField = (typeof textFields)[number];

//     const assignNullable = (field: TextField) => {
//       const value = user[field];
//       if (value === undefined) return;
//       const normalized = value ?? null;
//       values[field] = normalized;
//       updateSet[field] = normalized;
//     };

//     textFields.forEach(assignNullable);

//     if (user.lastSignedIn !== undefined) {
//       values.lastSignedIn = user.lastSignedIn;
//       updateSet.lastSignedIn = user.lastSignedIn;
//     }
//     if (user.role !== undefined) {
//       values.role = user.role;
//       updateSet.role = user.role;
//     } else if (user.openId === ENV.ownerOpenId) {
//       values.role = 'admin';
//       updateSet.role = 'admin';
//     }

//     if (!values.lastSignedIn) {
//       values.lastSignedIn = new Date();
//     }

//     if (Object.keys(updateSet).length === 0) {
//       updateSet.lastSignedIn = new Date();
//     }

//     await db.insert(users).values(values).onDuplicateKeyUpdate({
//       set: updateSet,
//     });
//   } catch (error) {
//     console.error("[Database] Failed to upsert user:", error);
//     throw error;
//   }
// }

// export async function getUserByOpenId(openId: string) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get user: database not available");
//     return undefined;
//   }

//   const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

//   return result.length > 0 ? result[0] : undefined;
// }

// export async function getAllUniversities() {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get universities: database not available");
//     return [];
//   }

//   try {
//     return await db.select().from(universities);
//   } catch (error) {
//     console.error("[Database] Failed to get universities:", error);
//     return [];
//   }
// }

// export async function getSpecializationsByUniversity(universityId: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get specializations: database not available");
//     return [];
//   }

//   try {
//     return await db.select().from(specializations).where(eq(specializations.universityId, universityId));
//   } catch (error) {
//     console.error("[Database] Failed to get specializations:", error);
//     return [];
//   }
// }

// export async function createSubmission(submission: InsertSubmission) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot create submission: database not available");
//     return null;
//   }

//   try {
//     const result = await db.insert(submissions).values(submission);
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to create submission:", error);
//     throw error;
//   }
// }

// export async function getUniversityById(universityId: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get university: database not available");
//     return null;
//   }

//   try {
//     const result = await db.select().from(universities).where(eq(universities.id, universityId)).limit(1);
//     return result.length > 0 ? result[0] : null;
//   } catch (error) {
//     console.error("[Database] Failed to get university:", error);
//     return null;
//   }
// }

// // ============= ADMIN FUNCTIONS =============

// // Universities Management
// export async function createUniversity(university: InsertUniversity) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot create university: database not available");
//     return null;
//   }

//   try {
//     const result = await db.insert(universities).values(university);
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to create university:", error);
//     throw error;
//   }
// }

// export async function updateUniversity(id: number, university: Partial<InsertUniversity>) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot update university: database not available");
//     return null;
//   }

//   try {
//     const result = await db.update(universities).set(university).where(eq(universities.id, id));
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to update university:", error);
//     throw error;
//   }
// }

// export async function deleteUniversity(id: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot delete university: database not available");
//     return null;
//   }

//   try {
//     // First delete all related specializations
//     await db.delete(specializations).where(eq(specializations.universityId, id));
//     // Then delete the university
//     const result = await db.delete(universities).where(eq(universities.id, id));
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to delete university:", error);
//     throw error;
//   }
// }

// // Specializations Management
// export async function getAllSpecializations() {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get specializations: database not available");
//     return [];
//   }

//   try {
//     return await db.select().from(specializations);
//   } catch (error) {
//     console.error("[Database] Failed to get specializations:", error);
//     return [];
//   }
// }

// export async function createSpecialization(specialization: InsertSpecialization) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot create specialization: database not available");
//     return null;
//   }

//   try {
//     const result = await db.insert(specializations).values(specialization);
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to create specialization:", error);
//     throw error;
//   }
// }

// export async function updateSpecialization(id: number, specialization: Partial<InsertSpecialization>) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot update specialization: database not available");
//     return null;
//   }

//   try {
//     const result = await db.update(specializations).set(specialization).where(eq(specializations.id, id));
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to update specialization:", error);
//     throw error;
//   }
// }

// export async function deleteSpecialization(id: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot delete specialization: database not available");
//     return null;
//   }

//   try {
//     const result = await db.delete(specializations).where(eq(specializations.id, id));
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to delete specialization:", error);
//     throw error;
//   }
// }

// // Submissions Management
// export async function getAllSubmissions() {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get submissions: database not available");
//     return [];
//   }

//   try {
//     return await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
//   } catch (error) {
//     console.error("[Database] Failed to get submissions:", error);
//     return [];
//   }
// }

// export async function getSubmissionById(id: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get submission: database not available");
//     return null;
//   }

//   try {
//     const result = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
//     return result.length > 0 ? result[0] : null;
//   } catch (error) {
//     console.error("[Database] Failed to get submission:", error);
//     return null;
//   }
// }

// export async function deleteSubmission(id: number) {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot delete submission: database not available");
//     return null;
//   }

//   try {
//     const result = await db.delete(submissions).where(eq(submissions.id, id));
//     return result;
//   } catch (error) {
//     console.error("[Database] Failed to delete submission:", error);
//     throw error;
//   }
// }

// // Statistics
// export async function getStatistics() {
//   const db = await getDb();
//   if (!db) {
//     console.warn("[Database] Cannot get statistics: database not available");
//     return {
//       totalUniversities: 0,
//       totalSpecializations: 0,
//       totalSubmissions: 0,
//       recentSubmissions: 0,
//     };
//   }

//   try {
//     const allUniversities = await db.select().from(universities);
//     const allSpecializations = await db.select().from(specializations);
//     const allSubmissions = await db.select().from(submissions);
    
//     // Get submissions from last 7 days
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const recentSubmissions = allSubmissions.filter(s => new Date(s.submittedAt) >= sevenDaysAgo);

//     return {
//       totalUniversities: allUniversities.length,
//       totalSpecializations: allSpecializations.length,
//       totalSubmissions: allSubmissions.length,
//       recentSubmissions: recentSubmissions.length,
//     };
//   } catch (error) {
//     console.error("[Database] Failed to get statistics:", error);
//     return {
//       totalUniversities: 0,
//       totalSpecializations: 0,
//       totalSubmissions: 0,
//       recentSubmissions: 0,
//     };
//   }
// }


import { eq, desc } from "drizzle-orm";
// تم استبدال drizzle-orm/mysql2 بـ drizzle-orm/node-postgres
import { drizzle } from "drizzle-orm/node-postgres";
// تم استبدال mysql2 بـ pg (مكتبة اتصال PostgreSQL)
import { Pool } from 'pg'; 

import { InsertUser, InsertSubmission, InsertUniversity, InsertSpecialization, users, universities, specializations, submissions, files } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null; // إضافة متغير لتخزين Pool

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // 1. إنشاء Pool للاتصال بـ PostgreSQL باستخدام DATABASE_URL
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      // 2. استخدام Drizzle مع Pool
      _db = drizzle(_pool);
      console.log("[Database] Connected successfully to PostgreSQL.");

    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

// ... بقية الوظائف (upsertUser, getAllUniversities, إلخ) لا تحتاج إلى تعديل ...
// فقط تم حذف onDuplicateKeyUpdate واستبداله بـ onConflictDoUpdate لـ PostgreSQL
// *ملاحظة: هذا يتطلب تحديثاً لملف schema.ts أيضاً إذا لم تكن قد فعلت ذلك مسبقاً*

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // التعديل: استبدال onDuplicateKeyUpdate بـ onConflictDoUpdate لـ PostgreSQL
    await db.insert(users).values(values).onConflictDoUpdate({
        target: users.openId, // حقل التعارض
        set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// ... (بقية الدوال تبقى كما هي) ...

// ملاحظة: تم إدراج بقية الكود هنا كما هو لضمان عدم تغيير منطق الدوال الأخرى
// ----------------------------------------------------------------------------------

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUniversities() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get universities: database not available");
    return [];
  }

  try {
    return await db.select().from(universities);
  } catch (error) {
    console.error("[Database] Failed to get universities:", error);
    return [];
  }
}

export async function getSpecializationsByUniversity(universityId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get specializations: database not available");
    return [];
  }

  try {
    return await db.select().from(specializations).where(eq(specializations.universityId, universityId));
  } catch (error) {
    console.error("[Database] Failed to get specializations:", error);
    return [];
  }
}

export async function createSubmission(submission: InsertSubmission) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create submission: database not available");
    return null;
  }

  try {
    const result = await db.insert(submissions).values(submission);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create submission:", error);
    throw error;
  }
}

export async function getUniversityById(universityId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get university: database not available");
    return null;
  }

  try {
    const result = await db.select().from(universities).where(eq(universities.id, universityId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get university:", error);
    return null;
  }
}

// ============= ADMIN FUNCTIONS =============

// Universities Management
export async function createUniversity(university: InsertUniversity) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create university: database not available");
    return null;
  }

  try {
    const result = await db.insert(universities).values(university);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create university:", error);
    throw error;
  }
}

export async function updateUniversity(id: number, university: Partial<InsertUniversity>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update university: database not available");
    return null;
  }

  try {
    const result = await db.update(universities).set(university).where(eq(universities.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update university:", error);
    throw error;
  }
}

export async function deleteUniversity(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete university: database not available");
    return null;
  }

  try {
    // First delete all related specializations
    await db.delete(specializations).where(eq(specializations.universityId, id));
    // Then delete the university
    const result = await db.delete(universities).where(eq(universities.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete university:", error);
    throw error;
  }
}

// Specializations Management
export async function getAllSpecializations() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get specializations: database not available");
    return [];
  }

  try {
    return await db.select().from(specializations);
  } catch (error) {
    console.error("[Database] Failed to get specializations:", error);
    return [];
  }
}

export async function createSpecialization(specialization: InsertSpecialization) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create specialization: database not available");
    return null;
  }

  try {
    const result = await db.insert(specializations).values(specialization);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create specialization:", error);
    throw error;
  }
}

export async function updateSpecialization(id: number, specialization: Partial<InsertSpecialization>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update specialization: database not available");
    return null;
  }

  try {
    const result = await db.update(specializations).set(specialization).where(eq(specializations.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update specialization:", error);
    throw error;
  }
}

export async function deleteSpecialization(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete specialization: database not available");
    return null;
  }

  try {
    const result = await db.delete(specializations).where(eq(specializations.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete specialization:", error);
    throw error;
  }
}

// Submissions Management
export async function getAllSubmissions() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get submissions: database not available");
    return [];
  }

  try {
    return await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
  } catch (error) {
    console.error("[Database] Failed to get submissions:", error);
    return [];
  }
}

export async function getSubmissionById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get submission: database not available");
    return null;
  }

  try {
    const result = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get submission:", error);
    return null;
  }
}

export async function deleteSubmission(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete submission: database not available");
    return null;
  }

  try {
    const result = await db.delete(submissions).where(eq(submissions.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete submission:", error);
    return null;
  }
}

// Statistics
export async function getStatistics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get statistics: database not available");
    return {
      totalUniversities: 0,
      totalSpecializations: 0,
      totalSubmissions: 0,
      recentSubmissions: 0,
    };
  }

  try {
    const allUniversities = await db.select().from(universities);
    const allSpecializations = await db.select().from(specializations);
    const allSubmissions = await db.select().from(submissions);
    
    // Get submissions from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissions = allSubmissions.filter(s => new Date(s.submittedAt) >= sevenDaysAgo);

    return {
      totalUniversities: allUniversities.length,
      totalSpecializations: allSpecializations.length,
      totalSubmissions: allSubmissions.length,
      recentSubmissions: recentSubmissions.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get statistics:", error);
    return {
      totalUniversities: 0,
      totalSpecializations: 0,
      totalSubmissions: 0,
      recentSubmissions: 0,
    };
  }
}