import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { SignJWT } from 'jose';
import { ENV } from './_core/env';

// Middleware to check if user is admin
const adminProcedure = publicProcedure; // تم تعطيل الحماية بناءً على طلب المستخدم

export const appRouter = router({
  // تم إصلاح خطأ الصيغة هنا وإضافة إجراء الدخول (login)
  login: publicProcedure
    .input(z.object({
      // الافتراض: المشروع يستخدم openId للدخول
      openId: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // الكود المفقود يخص معالجة الـ openId والتحقق
      if (input.openId !== ENV.OWNER_OPEN_ID) {
         throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      // توليد الرمز (JWT Token)
      const token = await new SignJWT({
        openId: input.openId,
        role: 'admin', // افتراض الدور بعد التحقق
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d') // تنتهي صلاحيته بعد يوم
        .sign(new TextEncoder().encode(ENV.JWT_SECRET));

      // سيقوم العميل (Client) بتعيين الكوكي (Cookie)
      return { token };
    }), // <--- الفاصلة هنا ضرورية

  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Assignment submission routes
  submission: router({
    getUniversities: publicProcedure.query(async () => {
      return await db.getAllUniversities();
    }),

    getSpecializations: publicProcedure.input(z.object({
      universityId: z.number(),
    })).query(async ({ input }) => {
      return await db.getSpecializationsByUniversity(input.universityId);
    }),

    submit: publicProcedure.input(z.object({
      studentName: z.string().min(1),
      universityId: z.number(),
      specializationId: z.number(),
      groupNumber: z.string().min(1),
      files: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number(),
        mimeType: z.string(),
      })),
    })).mutation(async ({ input }) => {
      try {
        // Create submission record
        const submission = await db.createSubmission({
          studentName: input.studentName,
          universityId: input.universityId,
          specializationId: input.specializationId,
          groupNumber: input.groupNumber,
        });

        if (!submission) {
          throw new Error('Failed to create submission');
        }

        // Get university details for Telegram
        const university = await db.getUniversityById(input.universityId);
        if (!university) {
          throw new Error('University not found');
        }

        // Get specialization details
        const specializations = await db.getSpecializationsByUniversity(input.universityId);
        const specialization = specializations.find(s => s.id === input.specializationId);
        if (!specialization) {
          throw new Error('Specialization not found');
        }

        // Send to Telegram
        const { sendSubmissionToTelegram } = await import('./telegram');
        const telegramSuccess = await sendSubmissionToTelegram(
          university.telegramBotToken,
          university.telegramChatId,
          input.studentName,
          university.name,
          specialization.name,
          input.groupNumber,
          input.files.map(f => ({
            fileName: f.fileName,
            fileUrl: f.fileUrl,
          }))
        );

        return {
          success: true,
          submissionId: (submission as any).insertId || 1,
          telegramNotified: telegramSuccess,
        };
      } catch (error) {
        console.error('[Submission] Error:', error);
        throw error;
      }
    }),
  }),

  // Admin routes
  admin: router({
    // Statistics
    getStatistics: adminProcedure.query(async () => {
      return await db.getStatistics();
    }),

    // Universities Management
    universities: router({
      getAll: adminProcedure.query(async () => {
        return await db.getAllUniversities();
      }),

      getById: adminProcedure.input(z.object({
        id: z.number(),
      })).query(async ({ input }) => {
        return await db.getUniversityById(input.id);
      }),

      create: adminProcedure.input(z.object({
        name: z.string().min(1),
        telegramBotToken: z.string().min(1),
        telegramChatId: z.string().min(1),
      })).mutation(async ({ input }) => {
        try {
          const result = await db.createUniversity(input);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to create university:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create university',
          });
        }
      }),

      update: adminProcedure.input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        telegramBotToken: z.string().min(1).optional(),
        telegramChatId: z.string().min(1).optional(),
      })).mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          const result = await db.updateUniversity(id, data);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to update university:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update university',
          });
        }
      }),

      delete: adminProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input }) => {
        try {
          const result = await db.deleteUniversity(input.id);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to delete university:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete university',
          });
        }
      }),
    }),

    // Specializations Management
    specializations: router({
      getAll: adminProcedure.query(async () => {
        return await db.getAllSpecializations();
      }),

      getByUniversity: adminProcedure.input(z.object({
        universityId: z.number(),
      })).query(async ({ input }) => {
        return await db.getSpecializationsByUniversity(input.universityId);
      }),

      create: adminProcedure.input(z.object({
        universityId: z.number(),
        name: z.string().min(1),
      })).mutation(async ({ input }) => {
        try {
          const result = await db.createSpecialization(input);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to create specialization:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create specialization',
          });
        }
      }),

      update: adminProcedure.input(z.object({
        id: z.number(),
        universityId: z.number().optional(),
        name: z.string().min(1).optional(),
      })).mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          const result = await db.updateSpecialization(id, data);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to update specialization:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update specialization',
          });
        }
      }),

      delete: adminProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input }) => {
        try {
          const result = await db.deleteSpecialization(input.id);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to delete specialization:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete specialization',
          });
        }
      }),
    }),

    // Submissions Management
    submissions: router({
      getAll: adminProcedure.query(async () => {
        return await db.getAllSubmissions();
      }),

      getById: adminProcedure.input(z.object({
        id: z.number(),
      })).query(async ({ input }) => {
        return await db.getSubmissionById(input.id);
      }),

      delete: adminProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input }) => {
        try {
          const result = await db.deleteSubmission(input.id);
          return { success: true, result };
        } catch (error) {
          console.error('[Admin] Failed to delete submission:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete submission',
          });
        }
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;